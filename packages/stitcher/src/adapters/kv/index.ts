import { env } from "../../env";

interface KeyValue {
  set(key: string, value: string, ttl: number): Promise<void>;
  get(key: string): Promise<string | null>;
}

export let kv: KeyValue;

if (env.SERVERLESS) {
  kv = await import("./cloudflare-kv");
} else {
  kv = await import("./redis");
}
