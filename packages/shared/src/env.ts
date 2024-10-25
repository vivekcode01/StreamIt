import { Type as t } from "@sinclair/typebox";
import { Value, AssertError } from "@sinclair/typebox/value";
import findConfig from "find-config";
import { config } from "dotenv";
import { formatFails } from "./typebox";

let envConfigLoaded = false;

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

export let envOverride: object | null = null;

export function setEnvOverride(obj: object) {
  envOverride = obj;
}

export function parseEnv<R extends Parameters<typeof t.Object>[0]>(
  resolve: ParseEnvResolve<R>,
) {
  if (!envOverride) {
    // If we didn't override the env variables, try and load them from
    // the config.env file.
    loadConfigEnv();
  }

  const schema = t.Object(resolve(t));

  // Fallback on process.env when we didn't override them explicitly.
  const env = envOverride ?? process.env;

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
