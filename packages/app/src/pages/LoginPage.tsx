import logo from "../assets/logo-mascotte.png";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/AuthContext";
import z from "zod";
import { AutoForm } from "@/components/ui/autoform";
import { ZodProvider } from "@autoform/zod";
import { Navigate } from "react-router-dom";
import { buildZodFieldConfig } from "@autoform/react";
import { Button } from "@/components/ui/button";
import type { FieldTypes } from "@/components/ui/autoform";

const fieldConfig = buildZodFieldConfig<FieldTypes>();

const schemaProvider = new ZodProvider(
  z.object({
    username: z.string(),
    password: z.string().superRefine(
      fieldConfig({
        inputProps: {
          type: "password",
        },
      }),
    ),
  }),
);

export function LoginPage() {
  const [show, setShow] = useState(false);
  const data = useContext(AuthContext);

  useEffect(() => {
    if (show) {
      return;
    }

    const timerId = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [show]);

  if (data.token !== null) {
    return <Navigate to="/" />;
  }

  return (
    <div className="pt-24">
      <div className="relative max-w-sm w-full mx-auto">
        <div
          className={cn(
            "flex justify-center transition-transform",
            show ? "translate-y-0" : "translate-y-24",
          )}
        >
          <img src={logo} className="w-16 mb-4" />
        </div>
        <div
          className={cn(
            "transition-all",
            show ? "opacity-100" : "opacity-0 scale-75",
          )}
        >
          <AutoForm schema={schemaProvider} onSubmit={data.login}>
            <div className="flex items-center gap-4">
              <Button
                disabled={data.loading}
                className={cn(
                  "w-full relative transition-transform",
                  show ? "translate-y-0" : "translate-y-12",
                )}
                variant="secondary"
                type="submit"
              >
                Sign in
              </Button>
              {data.error ? (
                <div className="text-red-400">Invalid credentials...</div>
              ) : null}
            </div>
          </AutoForm>
        </div>
      </div>
    </div>
  );
}
