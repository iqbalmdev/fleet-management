import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  DATA_BACKEND: z.enum(["supabase", "file"]).default("file"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16),
  MAIL_MODE: z.enum(["console", "ethereal", "smtp"]).default("ethereal"),
  MAIL_FROM: z.string().default("Fleet Management <noreply@fleet.local>"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid server environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

if (data.DATA_BACKEND === "supabase") {
  if (!data.SUPABASE_URL || !data.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("DATA_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
}

export const env = data;
