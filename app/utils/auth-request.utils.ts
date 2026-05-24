import { NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "./auth-token.utils";

type AccessTokenPayload = JwtPayload & {
  _id?: string;
};

const isTokenVerificationError = (error: unknown) =>
  error instanceof Error &&
  ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name);

export const unauthorizedResponse = (error = "Unauthorized.") =>
  NextResponse.json({ success: false, error }, { status: 401 });

export const getUserIdFromAccessToken = (request: NextRequest) => {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) return null;

  try {
    const verifiedToken = verifyAccessToken(accessToken) as AccessTokenPayload;
    return verifiedToken?._id || null;
  } catch (error) {
    if (isTokenVerificationError(error)) return null;
    throw error;
  }
};
