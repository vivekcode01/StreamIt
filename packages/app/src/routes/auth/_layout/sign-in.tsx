import { Card, CardBody, CardHeader } from "@nextui-org/card";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAuth } from "../../../auth";
import { Form } from "../../../components/Form";

export const Route = createFileRoute("/auth/_layout/sign-in")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  return (
    <Card className="p-4">
      <CardHeader className="font-bold text-lg">Sign in</CardHeader>
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
            await router.invalidate();
            await navigate({ to: "/" });
          }}
        />
      </CardBody>
    </Card>
  );
}
