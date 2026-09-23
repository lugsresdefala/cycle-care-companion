import {
  generateKeyPairSync,
  sign as signJwt,
  type KeyObject,
} from "node:crypto";
import {
  clerkMiddleware,
  getAuth,
  type ClerkMiddlewareOptions,
} from "@clerk/express";
import type { RequestHandler } from "express";

const FRONTEND_API = "clerk.synthetic-fixture.test";
const PUBLISHABLE_KEY = `pk_test_${Buffer.from(`${FRONTEND_API}$`).toString("base64url")}`;
const SECRET_KEY = "sk_test_synthetic_fixture_not_a_real_secret";
const KEY_ID = "clerk_fixture_key";
const DEFAULT_USER_ID = "user_clerk_fixture";

export interface ClerkFixtureTokenOptions {
  expired?: boolean;
  invalidSignature?: boolean;
  userId?: string;
}

export interface ClerkFixture {
  middleware: RequestHandler;
  token(options?: ClerkFixtureTokenOptions): string;
  getAuth: typeof getAuth;
}

function createRsaKeyPair() {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
}

function encodeJson(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createToken(
  privateKey: KeyObject | string,
  options: ClerkFixtureTokenOptions = {},
): string {
  const now = Math.floor(Date.now() / 1_000);
  const issuedAt = options.expired ? now - 600 : now - 5;
  const userId = options.userId ?? DEFAULT_USER_ID;
  const header = encodeJson({
    alg: "RS256",
    kid: KEY_ID,
    typ: "JWT",
  });
  const payload = encodeJson({
    azp: "http://localhost",
    exp: options.expired ? now - 60 : now + 300,
    iat: issuedAt,
    iss: `https://${FRONTEND_API}`,
    nbf: issuedAt,
    sid: `sess_${userId}`,
    sub: userId,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = signJwt("RSA-SHA256", Buffer.from(unsignedToken), privateKey);

  return `${unsignedToken}.${signature.toString("base64url")}`;
}

/**
 * Creates a completely local Clerk authentication fixture. The returned
 * middleware is Clerk's real middleware, configured to verify JWTs against the
 * fixture's ephemeral public key without making a JWKS request.
 *
 * Tests that exercise code calling `clerkClient.users.getUser` should spy on
 * that single method and restore the spy after the test. No Clerk client method
 * is replaced by this fixture.
 */
export function createClerkFixture(): ClerkFixture {
  const signingKeys = createRsaKeyPair();
  const invalidSigningKeys = createRsaKeyPair();
  const middlewareOptions: ClerkMiddlewareOptions = {
    publishableKey: PUBLISHABLE_KEY,
    secretKey: SECRET_KEY,
    jwtKey: signingKeys.publicKey,
  };

  return {
    middleware: clerkMiddleware(middlewareOptions),
    getAuth,
    token(options = {}) {
      const privateKey = options.invalidSignature
        ? invalidSigningKeys.privateKey
        : signingKeys.privateKey;
      return createToken(privateKey, options);
    },
  };
}