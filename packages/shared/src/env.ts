import { Type as t } from "@sinclair/typebox";
import { Value, AssertError } from "@sinclair/typebox/value";
import findConfig from "find-config";
import { config } from "dotenv";
import { formatFails } from "./typebox";

let envConfigLoaded = false;
let envVars: object | null = null;

function loadConfigEnv() {
  if (envConfigLoaded) {
    return;
  }
  const configPath = findConfig("config.env");
  if (configPath) {
    config({ path: configPath });
  }
  envConfigLoaded = true;
}

type ParseEnvResolve<R extends Parameters<typeof t.Object>[0]> = (
  typeBox: typeof t,
) => R;

export function setEnvVars(vars: object) {
  envVars = vars;
}

export function parseEnv<R extends Parameters<typeof t.Object>[0]>(
  resolve: ParseEnvResolve<R>,
) {
  loadConfigEnv();

  const schema = t.Object(resolve(t));
  const env = envVars ?? process.env;

  try {
    return Value.Parse(schema, env);
  } catch (error) {
    if (error instanceof AssertError) {
      throw new Error(
        "Missing env variables.\n" + formatFails(error).join("\n"),
      );
    }
    throw error;
  }
}
