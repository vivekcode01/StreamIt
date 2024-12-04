import { config } from "dotenv";
import findConfig from "find-config";
import { z } from "zod";

// When we are running tests, we are not going to allow reading env variables
// from the config.env file as they might produce different results when running
// the tests locally.
const isTestEnv = process.env.NODE_ENV === "test";

const configPath = findConfig("config.env");
if (configPath && !isTestEnv) {
  config({ path: configPath });
}

type ParseEnvResolve<S extends z.ZodRawShape> = (parser: typeof z) => S;

export function parseEnv<S extends z.ZodRawShape>(resolve: ParseEnvResolve<S>) {
  const schema = z.object(resolve(z));
  return schema.parse(process.env);
}
