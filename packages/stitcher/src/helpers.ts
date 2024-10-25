export function verifySig(obj: object, secret: string, sig?: string) {
  if (!sig) {
    return false;
  }

  const hasher = new Bun.CryptoHasher("shake128");
  hasher.update(secret);
  hasher.update(JSON.stringify(obj));
  const digest = hasher.digest("base64");

  return sig === digest;
}
