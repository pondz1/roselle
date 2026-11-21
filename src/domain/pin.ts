const PIN_PATTERN = /^\d{4}$/;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Validate that a PIN consists of exactly 4 ASCII digits. */
export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/** Generate a 16-byte cryptographic random salt encoded as lowercase hex. */
export function generatePinSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/** Hash a 4-digit PIN with its salt using SHA-256 via Web Crypto API. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  const encoded = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(digest));
}

/** Verify a candidate PIN against a stored salt and SHA-256 hash using fixed-length comparison. */
export async function verifyPin(
  pin: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  if (!isValidPin(pin) || !salt || !expectedHash) {
    return false;
  }
  const candidateHash = await hashPin(pin, salt);
  if (candidateHash.length !== expectedHash.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < candidateHash.length; i += 1) {
    diff |= candidateHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}
