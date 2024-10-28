import { swagger } from "@elysiajs/swagger";
import Elysia, { type TSchema } from "elysia";
import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";

const customCss = `
  .scalar-container.z-overlay {
    padding-left: 16px;
    padding-right: 16px;
  }

  .scalar-api-client__send-request-button, .show-api-client-button {
    background: var(--scalar-button-1);
  }
`;

export async function scalar(params: {
  documentation: ElysiaSwaggerConfig["documentation"];
  models?: Record<string, TSchema>;
}) {
  return new Elysia()
    .use(
      swagger({
        documentation: params.documentation,
        scalarConfig: {
          hideDownloadButton: true,
          customCss,
        },
      }),
    )
    .model(params.models ?? {})
    .onAfterHandle(async ({ request, response, set }) => {
      const url = new URL(request.url);

      const token = url.search.replace("?token=", "");

      if (!url.pathname.endsWith("/swagger")) {
        return;
      }

      if (!isResponse(response)) {
        return;
      }

      const html = await getHTML(response);
      const configuration = getConfiguration(html);

      set.headers["content-type"] = "text/html; charset=utf8";

      if (params.documentation?.components?.securitySchemes?.["bearerAuth"]) {
        configuration.authentication = {
          preferredSecurityScheme: "bearerAuth",
          http: {
            basic: {},
            bearer: { token },
          },
        };
      }

      return html.replace(
        /(data-configuration=')([^']*)(')/,
        `$1${JSON.stringify(configuration)}$3`,
      );
    });
}

async function getHTML(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType?.startsWith("text/html")) {
    throw new Error("Missing Content-Type text/html");
  }
  return await response.text();
}

function isResponse(value: unknown): value is Response {
  return typeof value === "object" && value !== null && "headers" in value;
}

function getConfiguration(html: string) {
  const match = html.match(/data-configuration='(.*?)'/);
  if (!match?.[1]) {
    throw new Error("Missing configuration");
  }
  return JSON.parse(match[1]);
}
