import { Type as t } from "@sinclair/typebox";
import { AssertError, Value } from "@sinclair/typebox/value";
import { config } from "dotenv";
import findConfig from "find-config";
import { formatFails } from "./typebox";

const configPath = findConfig("config.env");
if (configPath) {
  config({ path: configPath });
}

type ParseEnvResolve<R extends Parameters<typeof t.Object>[0]> = (
  typeBox: typeof t,
) => R;

export function parseEnv<R extends Parameters<typeof t.Object>[0]>(
  resolve: ParseEnvResolve<R>,
) {
  const schema = t.Object(resolve(t));

  try {
    return Value.Parse(schema, process.env);
  } catch (error) {
    if (error instanceof AssertError) {
      throw new Error(
        "Missing env variables.\n" + formatFails(error).join("\n"),
      );
    }
    throw error;
  }
}
