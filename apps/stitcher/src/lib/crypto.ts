import * as crypto from "secure-encrypt";

const DEFAULT_SECRET = "__UNSECURE__";

export function encrypt(value: string, secret = DEFAULT_SECRET) {
  return btoa(crypto.encrypt(value, secret));
}

export function decrypt(value: string, secret = DEFAULT_SECRET) {
  return crypto.decrypt(atob(value), secret);
}
