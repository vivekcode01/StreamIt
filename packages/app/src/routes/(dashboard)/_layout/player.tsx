import { Card } from "@nextui-org/react";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CodeEditor } from "../../../components/CodeEditor";
import { Form } from "../../../components/Form";
import { Player } from "../../../components/Player";
import { useSwaggerSchema } from "../../../hooks/useSwaggerSchema";
import type { FormRef } from "../../../components/Form";

export const Route = createFileRoute("/(dashboard)/_layout/player")({
  component: RouteComponent,
});

function RouteComponent() {
  const formRef = useRef<FormRef>(null);
  const [url, setUrl] = useState<string | null>(null);

  const schema = useSwaggerSchema(
    `${window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/swagger/json`,
    "/session",
  );

  return (
    <div className="p-8 h-screen flex gap-4">
      <div className="grow">
        <Player url={url} lang="eng" metadata={{}} />
        <Card className="mt-4 p-4">
          <Form
            ref={formRef}
            submit="Play"
            fields={{
              url: {
                label: "URL",
                type: "string",
                value: "",
              },
            }}
            onSubmit={async (values) => {
              setUrl(values.url);
            }}
          />
        </Card>
      </div>
      <Card className="py-4 px-0 grow max-w-md">
        <CodeEditor
          schema={schema}
          localStorageKey="stitcherEditor"
          onSave={async (body) => {
            const response = await fetch(
              `${window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/session`,
              {
                method: "post",
                headers: {
                  "Content-Type": "application/json",
                },
                body,
              },
            );

            if (response.ok) {
              const { url } = await response.json();
              formRef.current?.setValue("url", url);
              setUrl(url);
            }
          }}
        />
      </Card>
    </div>
  );
}
