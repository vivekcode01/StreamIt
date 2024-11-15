export function isRecordWithNumbers(
  obj: unknown,
): obj is Record<string, number> {
  if (typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    return false;
  }
  if (Object.getOwnPropertySymbols(obj).length > 0) {
    return false;
  }
  return Object.getOwnPropertyNames(obj).every(
    // @ts-expect-error prop is key
    (prop) => typeof obj[prop] === "number",
  );
}

export function mergeProps<T extends object>(
  value: T,
  defaultValues: Required<T>,
): Required<T> {
  Object.keys(value).forEach((key) => {
    // @ts-expect-error Valid key
    if (value[key] !== undefined) {
      // @ts-expect-error Valid prop
      defaultValues[key] = value[key];
    }
  });
  return defaultValues;
}
