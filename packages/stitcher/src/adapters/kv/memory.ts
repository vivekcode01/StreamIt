const kv = new Map<string, string>();

export async function set(key: string, value: string, ttl: number) {
  kv.set(key, value);
}

export async function get(key: string) {
  return kv.get(key);
}
