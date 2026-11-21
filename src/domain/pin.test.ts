import { generatePinSalt, hashPin, isValidPin, verifyPin } from './pin';

describe('PIN domain helpers', () => {
  it('validates strictly 4 ASCII digits', () => {
    expect(isValidPin('0000')).toBe(true);
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('')).toBe(false);
  });

  it('generates unique 32-char hex salts', () => {
    const saltA = generatePinSalt();
    const saltB = generatePinSalt();
    expect(saltA).toMatch(/^[0-9a-f]{32}$/);
    expect(saltB).toMatch(/^[0-9a-f]{32}$/);
    expect(saltA).not.toBe(saltB);
  });

  it('hashes deterministically per salt and varies across salts', async () => {
    const saltA = generatePinSalt();
    const saltB = generatePinSalt();
    const hash1 = await hashPin('4829', saltA);
    const hash2 = await hashPin('4829', saltA);
    const hashDifferentSalt = await hashPin('4829', saltB);

    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDifferentSalt);
  });

  it('verifies matching PIN and rejects wrong PIN or invalid input', async () => {
    const salt = generatePinSalt();
    const hash = await hashPin('1357', salt);

    await expect(verifyPin('1357', salt, hash)).resolves.toBe(true);
    await expect(verifyPin('1358', salt, hash)).resolves.toBe(false);
    await expect(verifyPin('135', salt, hash)).resolves.toBe(false);
    await expect(verifyPin('1357', '', hash)).resolves.toBe(false);
    await expect(verifyPin('1357', salt, '')).resolves.toBe(false);
  });
});
