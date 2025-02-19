import { Button, Input } from "@heroui/react";
import cn from "clsx";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { InputProps } from "@heroui/input";
import type { Control } from "react-hook-form";

interface FormProps<T extends FieldRecord> {
  className?: string;
  fields: T;
  onSubmit(values: FieldMap<T>): void | Promise<void>;
  submit?: string;
}

type Field = (
  | { type: "string"; value: string; format?: "password" }
  | { type: "number"; value: number }
) & {
  label: string;
  size?: "sm" | "md" | "lg";
};

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
  const [loading, setLoading] = useState(false);

  const entries = Object.entries(fields);

  const { handleSubmit, setValue, control, getValues } = useForm<FieldMap>({
    defaultValues: entries.reduce<FieldMap>((acc, [key, field]) => {
      acc[key] = field.value;
      return acc;
    }, {}),
  });

  useEffect(() => {
    const currentValues = getValues();
    Object.entries(fields).forEach(([name, field]) => {
      if (currentValues[name] !== field.value) {
        setValue(name, field.value);
      }
    });
  }, [fields]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const promise = onSubmit(values as FieldMap<T>);
        if (promise) {
          setLoading(true);
          promise.then(() => {
            setLoading(false);
          });
        }
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
            <FormInput
              name={name}
              control={control}
              label={field.label}
              type={type}
              size={field.size}
            />
          </div>
        );
      })}
      {submit ? (
        <div>
          <Button isLoading={loading} type="submit">
            {submit}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function FormInput({
  name,
  control,
  ...props
}: {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any>;
} & InputProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, formState }) => {
        return (
          <Input
            {...props}
            isInvalid={!!formState.errors?.[name]?.message}
            errorMessage={formState.errors?.[name]?.message?.toString()}
            value={field.value}
            onChange={field.onChange}
          />
        );
      }}
    ></Controller>
  );
}
