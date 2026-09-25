export function hasAdminCredentials(request: Request) {
  const authorization = request.headers.get("authorization");
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (
    !authorization?.startsWith("Basic ") ||
    !expectedUsername ||
    !expectedPassword
  ) {
    return false;
  }

  try {
    const decoded = atob(authorization.slice(6));
    return decoded === `${expectedUsername}:${expectedPassword}`;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Krillion admin"' },
  });
}
