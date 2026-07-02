// Shared auth configuration. The secret MUST be overridden in production via the
// JWT_SECRET env var; the fallback exists only so local/dev runs work out of the box.
export const JWT_SECRET =
  process.env.JWT_SECRET || 'keys-store-dev-secret-change-me';

// Token lifetime (12h — a full shop day).
export const TOKEN_TTL_SEC = 60 * 60 * 12;

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
