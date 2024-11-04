import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Form } from "../../../components/Form";
import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";

export const Route = createFileRoute("/auth/_layout/sign-in")({
  component: Index,
});

function Index() {
  const { signIn } = useAuth();
  const { user } = useUser();

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <Card className="p-4">
      <CardHeader className="font-bold text-2xl">Welcome</CardHeader>
      <CardBody>
        <Form
          submit="Sign in"
          fields={{
            username: {
              label: "Username",
              type: "string",
              value: "",
            },
            password: {
              label: "Password",
              type: "string",
              value: "",
              format: "password",
            },
          }}
          onSubmit={async (values) => {
            await signIn(values.username, values.password);
          }}
        />
      </CardBody>
    </Card>
  );
}
