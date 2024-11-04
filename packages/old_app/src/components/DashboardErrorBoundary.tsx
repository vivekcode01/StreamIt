import AlertCircle from "lucide-react/icons/alert-circle";
import type { FallbackProps } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DashboardErrorBoundary({ error }: FallbackProps) {
  let message = "An unknown error occured";
  let value: object | undefined;

  if (typeof error === "object") {
    if ("message" in error && error.message) {
      message = error.message;
    }

    if ("status" in error && typeof error.status === "number") {
      message = `${error.status}`;

      if ("value" in error && typeof error.value === "object") {
        value = error.value;
      }
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Alert className="max-w-md" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Uh-oh!</AlertTitle>
        <AlertDescription>
          <div className="my-4">{message}</div>
          {value ? <pre>{JSON.stringify(value, null, 2)}</pre> : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}
