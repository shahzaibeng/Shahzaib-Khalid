// Bracketed values in the config files mark content that has not been supplied yet.
export function isConfigured(value: string | undefined): value is string {
  return Boolean(value) && !value!.includes('[') && !value!.includes(']');
}
