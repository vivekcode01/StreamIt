import React from "react";
import type { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@/components/ui/input";

export const DateField: React.FC<AutoFormFieldProps> = ({
  inputProps,
  error,
  id,
}) => (
  <Input
    id={id}
    type="date"
    className={error ? "border-destructive" : ""}
    {...inputProps}
  />
);
