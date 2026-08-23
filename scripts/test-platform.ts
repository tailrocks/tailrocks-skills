export function isRestrictedLinuxCi(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return platform === "linux" && (environment.CI === "true" || environment.GITHUB_ACTIONS === "true");
}
