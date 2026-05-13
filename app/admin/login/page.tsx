"use client";

import { Button, Card, CardBody, Input } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, Shield } from "lucide-react";

import ThemeToggleButton from "../../../components/ThemeToggleButton";

import { formLayout, inputClassNames } from "@/config/design-system";
import { textColors, typography } from "@/config/typography";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const normalizeEmail = (value: string) =>
    value
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      .toLowerCase();

  const normalizePassword = (value: string) =>
    value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      email: normalizeEmail(email),
      password: normalizePassword(password),
    };

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await response.json();

        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-12 transition-colors duration-500 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute left-20 top-20 h-32 w-32 rounded-full bg-rose-500 blur-3xl" />
        <div className="absolute right-20 top-40 h-24 w-24 rounded-full bg-pink-500 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-16 w-16 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="absolute right-6 top-6 z-10">
        <ThemeToggleButton />
      </div>

      <div className="absolute left-6 top-6 z-10">
        <Button
          aria-label="Back to home"
          className="min-h-11"
          radius="lg"
          startContent={<ArrowLeft className="h-4 w-4" />}
          variant="bordered"
          onPress={() => {
            window.location.href = "/";
          }}
        >
          Back
        </Button>
      </div>

      <div className="relative z-10 mx-auto w-full px-4 sm:max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1
            className={`font-montserrat ${typography.headingPage} bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent`}
          >
            EGP Aesthetics
          </h1>
          <p
            className={`font-montserrat mt-2 ${typography.small} ${textColors.muted}`}
          >
            Admin Panel Access
          </p>
        </div>

        <Card className="border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-gray-700/20 dark:bg-gray-800/80 sm:rounded-3xl">
          <CardBody className="gap-0 px-6 py-8 sm:px-10">
            <form className={formLayout.sectionGap} onSubmit={handleSubmit}>
              <Input
                isRequired
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                classNames={inputClassNames}
                id="email"
                inputMode="email"
                label="Email Address"
                name="email"
                placeholder="admin@example.com"
                spellCheck="false"
                startContent={
                  <Mail className="h-5 w-5 shrink-0 text-default-400" />
                }
                type="email"
                value={email}
                variant="bordered"
                onValueChange={setEmail}
              />
              <Input
                isRequired
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect="off"
                classNames={inputClassNames}
                id="password"
                label="Password"
                name="password"
                placeholder="Enter your password"
                spellCheck="false"
                startContent={
                  <Lock className="h-5 w-5 shrink-0 text-default-400" />
                }
                type="password"
                value={password}
                variant="bordered"
                onValueChange={setPassword}
              />

              {error ? (
                <div className="rounded-xl border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
                  <p className="text-center text-sm font-medium text-danger-600 dark:text-danger-400">
                    {error}
                  </p>
                </div>
              ) : null}

              <Button
                className="min-h-12 w-full font-semibold"
                color="danger"
                isLoading={isLoading}
                radius="lg"
                type="submit"
                variant="shadow"
              >
                Sign In to Dashboard
              </Button>
            </form>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-900/20">
                <Shield className="mr-2 h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span
                  className={`text-sm font-medium ${textColors.body} dark:text-primary-300`}
                >
                  Secure Admin Access
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
