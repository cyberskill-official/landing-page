// TASK-OPS-004 env and secret management helper.
// Ensures we fail closed when required production keys are absent.

export function getRequiredEnv(key: string, requiredInProduction: boolean): string {
  const val = process.env[key];
  const isProd = process.env.NODE_ENV === "production";
  
  // Skip check during Vitest test runs unless explicitly testing production env errors
  const isTest = typeof process !== "undefined" && process.env.VITEST === "true" && process.env.FORCE_ENV_CHECK !== "true";

  if (!val && isProd && requiredInProduction && !isTest) {
    throw new Error(`MISSING_PRODUCTION_KEY_${key}`);
  }
  return val || "";
}
