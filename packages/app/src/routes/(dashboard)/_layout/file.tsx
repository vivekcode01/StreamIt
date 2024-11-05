import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import z from "zod";
import { FilePreview } from "../../../components/FilePreview";

export const Route = createFileRoute("/(dashboard)/_layout/file")({
  component: RouteComponent,
  validateSearch: zodSearchValidator(
    z.object({
      path: z.string().default("/"),
    }),
  ),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps, context }) => {
    return await context.auth.api.storage.file.get({ query: deps });
  },
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const { path } = Route.useLoaderDeps();

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 flex justify-center">
      <Card className="max-w-2xl">
        <CardHeader>{path}</CardHeader>
        <CardBody>
          <FilePreview data={data} />
        </CardBody>
      </Card>
    </div>
  );
}
