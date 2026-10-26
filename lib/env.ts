import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedPublicEnv.success) {
  throw new Error(`Invalid public environment variables: ${parsedPublicEnv.error.message}`);
}

export const publicEnv = parsedPublicEnv.data;
