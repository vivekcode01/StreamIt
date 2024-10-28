import { customCss } from "shared/scalar";
import { swagger } from "@elysiajs/swagger";
import Elysia from "elysia";

export async function scalar() {
  return new Elysia()
    .use(
      swagger({
        documentation: {
          info: {
            title: "Superstreamer API",
            description:
              "The Superstreamer API is organized around REST, returns JSON-encoded responses " +
              "and uses standard HTTP response codes and verbs.",
            version: "1.0.0",
          },
        },
        scalarConfig: {
          hideDownloadButton: true,
          customCss,
        },
      }),
    )
    .onAfterHandle(async ({ request, response, set }) => {
      const url = new URL(request.url);
      if (!url.pathname.endsWith("/swagger")) {
        return;
      }
      if (!("headers" in response)) {
        return;
      }
      const response_ = response as Response;
      const contentType = response_.headers.get("content-type");
      if (!contentType?.startsWith("text/html")) {
        return;
      }
      const html = await response_.text();
      set.headers["content-type"] = "text/html; charset=utf8";

      const match = html.match(/data-configuration='(.*?)'/);
      if (!match?.[1]) {
        return;
      }
      const json = JSON.parse(match[1]);

      if (json.authentication?.http?.bearer) {
        json.authentication.http.bearer.token = "hello";
      }

      return html.replace(
        /(data-configuration=')([^']*)(')/,
        `$1${JSON.stringify(json)}$3`,
      );
    });
}
