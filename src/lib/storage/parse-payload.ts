// Amplify's `a.json()` round-trip is asymmetric: writes are
// `JSON.stringify(...)` strings, reads can arrive as either the parsed object
// (typical) or the raw string (depending on backend resolver). Storage
// adapters call this on the way out so downstream consumers always see an
// object (or null for malformed payloads).
export const parseStoredPayloadJson = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
