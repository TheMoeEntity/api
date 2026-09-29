/** A single string field from FormData ("" if missing or not a string). */
export function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Every string value for a repeated field (e.g. checkboxes). */
export function fields(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string");
}
