import { config } from "dotenv";
import findConfig from "find-config";
import { z } from "zod";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

type ParseEnvResolve<S extends z.ZodRawShape> = (parser: typeof z) => S;

export function parseEnv<S extends z.ZodRawShape>(resolve: ParseEnvResolve<S>) {
  const schema = z.object(resolve(z));
  return schema.parse(process.env);
}
