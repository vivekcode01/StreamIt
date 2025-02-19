import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useApi } from "../../../api";
import { useAuth } from "../../../auth";
import { Form } from "../../../components/Form";

export const Route = createFileRoute("/auth/_layout/sign-in")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const navigate = useNavigate();
  const { api } = useApi();
  const { setToken } = useAuth();

  return (
    <Card className="p-4">
      <CardHeader className="font-bold text-lg">Sign in</CardHeader>
      <CardBody>
        <Form
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
            const response = await api.token.$post({
              json: values,
            });
            const { token } = await response.json();
            setToken(token);
            await router.invalidate();
            await navigate({ to: "/" });
          }}
          submit="Sign in"
        />
      </CardBody>
    </Card>
  );
}
