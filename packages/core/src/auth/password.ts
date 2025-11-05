import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a password for storage using bcrypt. Bcrypt is intentionally slow which protects
 * the single owner account from brute force attempts if the hash is leaked.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password to a previously hashed value.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
