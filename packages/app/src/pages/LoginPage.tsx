import logo from "../assets/logo-mascotte.png";
import { useContext } from "react";
import { AuthContext } from "@/AuthContext";
import z from "zod";
import { AutoForm } from "@/components/ui/autoform";
import { SubmitButton } from "@/components/ui/autoform/components/SubmitButton";
import { ZodProvider } from "@autoform/zod";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const schemaProvider = new ZodProvider(
  z.object({
    username: z.string(),
    password: z.string(),
  }),
);

export function LoginPage() {
  const data = useContext(AuthContext);

  if (data.token !== null) {
    return <Navigate to="/" />;
  }

  return (
    <div className="pt-24 max-w-sm w-full mx-auto">
      <div className="mb-8 flex flex-col items-center text-center">
        <img src={logo} className="w-16 mb-4" />
        <h1 className="font-semibold text-4xl bg-gradient-to-r from-[#ff4d00] to-[#ff9a00] inline-block text-transparent bg-clip-text">
          Superstreamer
        </h1>
      </div>
      <div className={cn(data.loading && "pointer-events-none opacity-50")}>
        <AutoForm schema={schemaProvider} onSubmit={data.login}>
          <div className="flex items-center gap-4">
            <SubmitButton>Login</SubmitButton>
            {data.error ? (
              <div className="text-red-400">Invalid credentials...</div>
            ) : null}
          </div>
        </AutoForm>
      </div>
    </div>
  );
}
