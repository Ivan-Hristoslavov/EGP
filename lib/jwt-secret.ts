/**
 * Signing secret for login tokens. Fails loudly when it is missing instead of
 * silently falling back to a value that is public in the source code.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}
