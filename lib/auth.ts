/**
 * Simple authentication utilities
 */

const AUTH_TOKEN_KEY = 'german-app-auth-token';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const authData = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!authData) return false;

  try {
    const { timestamp } = JSON.parse(authData);
    const now = Date.now();

    // Check if session has expired
    if (now - timestamp > SESSION_DURATION) {
      logout();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Set authentication token (client-side)
 */
export function setAuthToken(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({
    timestamp: Date.now()
  }));
}

/**
 * Clear authentication token
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
