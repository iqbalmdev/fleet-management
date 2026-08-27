# FleetCare — client-only prototype

Next.js UI only. **No Express / backend server required.**  
Auth and fleet data live in the browser (`localStorage`) so you can deploy on **Vercel**.

```
client/   Next.js app (port 3001)
server/   optional / unused for this prototype
```

## Run locally

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3001

## Deploy on Vercel

1. Set **Root Directory** to `client`
2. Build command: `npm run build`
3. Output: Next.js defaults
4. No env vars required for the prototype

## Demo sign-in accounts

| Role | Tab | Identifier | Password |
|------|-----|------------|----------|
| Admin | Admin | `ORG-1001` or `admin@fleetcare.demo` | `Admin@123` |
| Driver | Driver | `driver@fleetcare.demo` | `Driver@123` |

## Notes

- Signup creates an admin org in localStorage
- Drivers / vehicles you add are stored in the same browser
- Clearing site data resets the prototype seed
- Module screens (routes, maintenance, bills, etc.) use sample UI data
