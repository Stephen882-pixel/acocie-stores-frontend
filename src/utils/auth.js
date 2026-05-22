/**
 * Normalize login/verify responses from the API.
 * Backend returns tokens at the top level: { accessToken, refreshToken, user }.
 */
export function extractAuthPayload(body) {
  if (!body) return null;
  if (body.accessToken && body.user) {
    return {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      user: body.user,
    };
  }
  if (body.data?.accessToken && body.data?.user) {
    return {
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
      user: body.data.user,
    };
  }
  return null;
}

export const REMEMBER_EMAIL_KEY = 'acocie-remember-email';
