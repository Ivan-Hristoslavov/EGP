import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { supabaseAdmin } from "@/lib/supabase";

// Rate limiting: keyed by IP address
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function normalizeLoginEmail(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
}

function normalizeLoginPassword(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();

  // Check rate limit
  const record = loginAttempts.get(ip);
  if (record && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  let email: string | null = null;
  let password: string | null = null;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    const rawEmail = typeof body.email === "string" ? body.email : null;
    const rawPassword = typeof body.password === "string" ? body.password : null;

    email = rawEmail ? normalizeLoginEmail(rawEmail) : null;
    password = rawPassword ? normalizeLoginPassword(rawPassword) : null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin profile by email (use service role to bypass RLS).
    // Email is normalized to lowercase + trim so autofill / locale quirks match DB.
    const { data: adminProfile, error } = await supabaseAdmin
      .from("admin_profile")
      .select("email, password")
      .eq("email", email)
      .maybeSingle();

    const valid =
      !error &&
      adminProfile &&
      (await bcrypt.compare(password, adminProfile.password));

    if (valid) {
      // Reset rate limit on success
      loginAttempts.delete(ip);

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return NextResponse.json(
          { error: "Server configuration error. Set JWT_SECRET in your environment (e.g. Vercel → Settings → Environment Variables)." },
          { status: 500 }
        );
      }

      const token = jwt.sign(
        { type: "admin", email: adminProfile.email },
        jwtSecret,
        { expiresIn: "7d" }
      );

      const cookieStore = await cookies();
      cookieStore.set("adminAuth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true });
    } else {
      // Increment failure counter
      const current = loginAttempts.get(ip) ?? { count: 0, blockedUntil: 0 };
      current.count += 1;
      if (current.count >= MAX_ATTEMPTS) {
        current.blockedUntil = now + BLOCK_DURATION_MS;
      }
      loginAttempts.set(ip, current);

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch {
    // Do not log or expose error details (may contain sensitive data)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("adminAuth");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
