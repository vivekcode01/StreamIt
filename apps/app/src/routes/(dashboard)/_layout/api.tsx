import { Select, SelectItem } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../../auth";

export const Route = createFileRoute("/(dashboard)/_layout/api")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useAuth();
  const [url, setUrl] = useState(window.__ENV__.PUBLIC_API_ENDPOINT);

  const params = {
    url: `${url}/openapi`,
    config: {
      baseServerURL: url,
      servers: [
        {
          url,
          description: "Main",
        },
      ],
      authentication: {
        preferredSecurityScheme: "userToken",
        http: {
          basic: {
            username: "",
            password: "",
          },
          bearer: {
            token,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="px-4 py-2 border-b border-gray-200">
        <Select
          selectedKeys={[url]}
          onChange={(event) => {
            setUrl(event.target.value);
          }}
          className="max-w-[200px]"
        >
          <SelectItem key={window.__ENV__.PUBLIC_API_ENDPOINT}>API</SelectItem>
          <SelectItem key={window.__ENV__.PUBLIC_STITCHER_ENDPOINT}>
            Stitcher
          </SelectItem>
        </Select>
      </div>
      <iframe
        title="API reference"
        className="grow"
        src={`https://superstreamer.xyz/scalar.html?params=${encodeURIComponent(JSON.stringify(params))}`}
      />
    </div>
  );
}
