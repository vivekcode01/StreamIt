import Cryptr from "cryptr";
import { env } from "../env";

const cryptr = new Cryptr(env.SUPER_SECRET ?? "__UNSECURE__", {
  encoding: "base64",
});

export function encrypt(value: string) {
  return cryptr.encrypt(value);
}

export function decrypt(value: string) {
  return cryptr.decrypt(value);
}
