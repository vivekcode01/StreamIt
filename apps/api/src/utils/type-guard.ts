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
