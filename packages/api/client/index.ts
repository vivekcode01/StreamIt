import { hc } from "hono/client";
import type { AppType } from "../src";

export class ApiClient {
  public client: ReturnType<typeof hc<AppType>>;

  private token_: string | null = null;

  constructor(url: string) {
    this.client = hc<AppType>(url, {
      headers: () => {
        const headers: Record<string, string> = {};
        if (this.token_ !== null) {
          headers["Authorization"] = `Bearer ${this.token_}`;
        }
        return headers;
      },
    });
  }

  setToken(token: string | null) {
    this.token_ = token;
  }
}
