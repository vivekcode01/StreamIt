import { config } from "dotenv";
import findConfig from "find-config";
import type { z } from "zod";

const env = process.env.NODE_ENV ?? "development";

const envConfigPath = findConfig(`config.env.${env}`);
const baseConfigPath = findConfig("config.env");

const configPath = envConfigPath ?? baseConfigPath;

// When we are running tests, we are not going to allow reading env variables
// from the config.env file as they might produce different results when running
// the tests locally.
const isTestEnv = process.env.NODE_ENV === "test";

if (configPath && !isTestEnv) {
  config({ path: configPath });
  console.log(`Loaded configuration from: ${configPath}`);
} else if (!isTestEnv) {
  console.warn(
    "No configuration file found, using existing environment variables.",
  );
}

export function getEnv(schema: z.ZodSchema) {
  return schema.parse(process.env);
}
