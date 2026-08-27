"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { ModuleRecord } from "@/components/module-workspace";

type LatLng = [number, number];

type RouteGeometry = {
  color: string;
  path: LatLng[];
  stops: Array<{ name: string; position: LatLng }>;
};

/** Sample Chennai-area geometries for demo routes */
const ROUTE_GEOMETRY: Record<string, RouteGeometry> = {
  "Zone A Morning": {
    color: "#38bdf8",
    path: [
      [13.0827, 80.2707],
      [13.0605, 80.2496],
      [13.0418, 80.2341],
      [13.0215, 80.2234],
      [12.9951, 80.2209],
    ],
    stops: [
      { name: "Depot", position: [13.0827, 80.2707] },
      { name: "Greenfield Gate", position: [13.0605, 80.2496] },
      { name: "Lake View", position: [13.0418, 80.2341] },
      { name: "Main campus", position: [12.9951, 80.2209] },
    ],
  },
  "Campus Express": {
    color: "#34d399",
    path: [
      [13.0500, 80.2500],
      [13.0350, 80.2400],
      [13.0200, 80.2300],
      [13.0050, 80.2250],
    ],
    stops: [
      { name: "Staff quarters", position: [13.0500, 80.2500] },
      { name: "Metro hub", position: [13.0350, 80.2400] },
      { name: "Campus East", position: [13.0050, 80.2250] },
    ],
  },
  "Zone B Evening": {
    color: "#fbbf24",
    path: [
      [12.9951, 80.2209],
      [13.0100, 80.2450],
      [13.0280, 80.2680],
      [13.0500, 80.2820],
    ],
    stops: [
      { name: "Main campus", position: [12.9951, 80.2209] },
      { name: "Ring Road", position: [13.0100, 80.2450] },
      { name: "Zone B Hub", position: [13.0500, 80.2820] },
    ],
  },
  "Staff Shuttle": {
    color: "#a78bfa",
    path: [
      [13.0700, 80.2600],
      [13.0550, 80.2500],
      [13.0400, 80.2450],
      [13.0250, 80.2400],
    ],
    stops: [
      { name: "Admin block", position: [13.0700, 80.2600] },
      { name: "Faculty parking", position: [13.0550, 80.2500] },
      { name: "Campus gate", position: [13.0250, 80.2400] },
    ],
  },
};

const DEFAULT_GEOMETRY: RouteGeometry = {
  color: "#94a3b8",
  path: [
    [13.06, 80.25],
    [13.04, 80.24],
    [13.02, 80.23],
  ],
  stops: [
    { name: "Start", position: [13.06, 80.25] },
    { name: "End", position: [13.02, 80.23] },
  ],
};

function geometryFor(routeName: string, index: number): RouteGeometry {
  if (ROUTE_GEOMETRY[routeName]) return ROUTE_GEOMETRY[routeName];
  const colors = ["#38bdf8", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
  const offset = (index % 5) * 0.012;
  return {
    color: colors[index % colors.length],
    path: DEFAULT_GEOMETRY.path.map(([lat, lng]) => [lat + offset, lng + offset * 0.6] as LatLng),
    stops: DEFAULT_GEOMETRY.stops.map((stop) => ({
      name: stop.name,
      position: [stop.position[0] + offset, stop.position[1] + offset * 0.6] as LatLng,
    })),
  };
}

export function RouteBoardMap({ rows }: { rows: ModuleRecord[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<LayerGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !rows.some((row) => row.id === selectedId)) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([13.04, 80.24], 12);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);

      setTimeout(() => map.invalidateSize(), 80);
    }

    void setup();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !layersRef.current) return;

    let cancelled = false;

    async function draw() {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current || !layersRef.current) return;

      layersRef.current.clearLayers();
      const bounds: LatLng[] = [];

      rows.forEach((row, index) => {
        const geo = geometryFor(row.route ?? `Route ${index + 1}`, index);
        const isActive = selected?.id === row.id;
        const weight = isActive ? 5 : 3;
        const opacity = isActive ? 1 : 0.45;

        const polyline = L.polyline(geo.path, {
          color: geo.color,
          weight,
          opacity,
        }).addTo(layersRef.current!);

        polyline.on("click", () => setSelectedId(row.id));

        geo.stops.forEach((stop, stopIndex) => {
          const marker = L.circleMarker(stop.position, {
            radius: isActive ? 7 : 5,
            color: geo.color,
            weight: 2,
            fillColor: isActive ? "#0b1220" : geo.color,
            fillOpacity: isActive ? 1 : 0.85,
          }).addTo(layersRef.current!);

          marker.bindPopup(
            `<strong>${row.route ?? "Route"}</strong><br/>Stop ${stopIndex + 1}: ${stop.name}<br/>${row.vehicle ?? "—"} · ${row.driver ?? "—"}`,
          );
          marker.on("click", () => setSelectedId(row.id));
          bounds.push(stop.position);
        });

        bounds.push(...geo.path);
      });

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [ready, rows, selected?.id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">Add a route to plot it on the map.</p>
        ) : (
          rows.map((row, index) => {
            const geo = geometryFor(row.route ?? "", index);
            const active = selected?.id === row.id;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-200"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: geo.color }}
                />
                {row.route}
              </button>
            );
          })
        )}
      </div>

      <div
        ref={containerRef}
        className="h-[360px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] [&_.leaflet-control-attribution]:bg-black/50 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-slate-400"
      />

      {selected ? (
        <div className="grid gap-3 rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-slate-300 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Route</p>
            <p className="mt-1 font-medium text-white">{selected.route}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Shift</p>
            <p className="mt-1 font-medium text-white">{selected.shift}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Vehicle</p>
            <p className="mt-1 font-medium text-white">{selected.vehicle}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Driver</p>
            <p className="mt-1 font-medium text-white">{selected.driver}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
