/** Extract a user-facing message from an Axios/API error response. */
export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return data.error ?? data.message ?? fallback;
}
