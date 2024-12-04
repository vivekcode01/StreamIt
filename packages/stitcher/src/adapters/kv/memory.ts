const kv = new Map<string, string>();

export async function set(key: string, value: string, ttl: number) {
  kv.set(key, value);
  await Promise.resolve(ttl);
}

export async function get(key: string) {
  return Promise.resolve(kv.get(key) ?? null);
}
