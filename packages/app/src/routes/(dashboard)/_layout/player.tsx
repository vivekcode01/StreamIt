import { Card } from "@nextui-org/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Form } from "../../../components/Form";
import { Player } from "../../../components/Player";

export const Route = createFileRoute("/(dashboard)/_layout/player")({
  component: RouteComponent,
});

function RouteComponent() {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="p-8 flex justify-center">
      <div className="max-w-2xl w-full">
        <Player url={url} lang="eng" metadata={{}} />
        <Card className="mt-4 p-4">
          <Form
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
    </div>
  );
}
