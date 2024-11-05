import { Button, Input } from "@nextui-org/react";
import cn from "clsx";
import { useForm } from "react-hook-form";

interface FormProps<T extends FieldRecord> {
  className?: string;
  fields: T;
  onSubmit(values: FieldMap<T>): void | Promise<void>;
  submit?: string;
}

type Field =
  | { type: "string"; label: string; value: string; format?: "password" }
  | { type: "number"; label: string; value: number };

type FieldRecord = Record<string, Field>;

type FieldMap<T extends FieldRecord = FieldRecord> = {
  [K in keyof T]: T[K] extends { value: infer V } ? V : never;
};

export function Form<T extends FieldRecord>({
  className,
  fields,
  onSubmit,
  submit,
}: FormProps<T>) {
  const entries = Object.entries(fields);

  const { register, handleSubmit } = useForm<FieldMap>({
    defaultValues: entries.reduce<FieldMap>((acc, [key, field]) => {
      acc[key] = field.value;
      return acc;
    }, {}),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        // @ts-expect-error Explicitly mapped
        onSubmit(values);
      })}
      className={cn("flex flex-col gap-4", className)}
      autoComplete="off"
    >
      {entries.map(([name, field]) => {
        let type: string | undefined;

        if (field.type === "string") {
          if (field.format === "password") {
            type = "password";
          }
        }

        return (
          <div key={name}>
            <Input {...register(name)} label={field.label} type={type} />
          </div>
        );
      })}
      <div>
        <Button type="submit">{submit ?? "Submit"}</Button>
      </div>
    </form>
  );
}
