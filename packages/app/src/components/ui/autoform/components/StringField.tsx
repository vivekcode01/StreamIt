import React from "react";
import type { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@/components/ui/input";

export const StringField: React.FC<AutoFormFieldProps> = ({
  inputProps,
  error,
  id,
}) => {
  const { key, ...rest } = inputProps;
  return (
    <Input
      id={id}
      className={error ? "border-destructive" : ""}
      key={key}
      {...rest}
    />
  );
};
