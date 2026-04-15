# Testing Guide (TDD-style)

This project uses **Vitest** for unit and integration tests, with **React Testing Library** for components.

## Commands

```bash
npm run test        # Watch mode - re-runs on file changes
npm run test:run    # Single run (no coverage)
npm run test:coverage  # Single run + coverage report + threshold enforcement (same as CI)
```

CI runs **`npm run test:coverage`**, which fails the job if global coverage drops below the thresholds in [`vitest.config.ts`](vitest.config.ts) (requires dev dependency `@vitest/coverage-v8`).

## Test Structure

Tests live next to the code they test:

- `config/typography.test.ts` → tests `config/typography.ts`
- `lib/image-utils.test.ts` → tests `lib/image-utils.ts`
- `lib/image-utils.heic.node.test.ts` → HEIC helper in Node (no `window`)
- `lib/stripe.test.ts` / `lib/stripe-server.test.ts` → Stripe constants and env-gated helpers
- `lib/stripe-payment.test.ts` → `createPaymentLink` / `createCheckoutSession` with mocked Stripe SDK
- `lib/image-utils.browser.test.ts` → canvas / HEIC / `processImageFile` paths in jsdom
- `lib/email-theme.test.ts` → tests `lib/email-theme.ts`
- `components/ButtonPrimary.test.tsx` → tests `components/ButtonPrimary.tsx`
- `components/ImageWithSkeleton.test.tsx` → tests `components/ImageWithSkeleton.tsx`
- `components/Toast.test.tsx` → tests `ToastProvider` / `useToast`
- `components/ReviewForm.test.tsx` → tests `components/ReviewForm.tsx`
- `components/SectionWhyChooseUs.test.tsx` → tests `components/SectionWhyChooseUs.tsx`
- `app/about/page.test.tsx` → tests `app/about/page.tsx`
- `app/api/admin/auth/route.test.ts` → login (success, validation, rate limit, JWT error), logout

## What's Tested

| Layer | Examples |
|-------|----------|
| **Config** | typography tokens, layout |
| **Lib** | image-utils, stripe constants, email-theme |
| **Components** | ButtonPrimary, ReviewForm, SectionWhyChooseUs |
| **Pages** | About page (mocked CMS / Supabase) |
| **API routes** | POST /api/admin/auth (validation) |

## Adding New Tests

1. **Unit test (pure functions)**  
   Create `*.test.ts` next to the file:

   ```ts
   import { describe, it, expect } from "vitest";
   import { myFunction } from "./my-module";

   describe("myFunction", () => {
     it("returns expected value", () => {
       expect(myFunction("input")).toBe("expected");
     });
   });
   ```

2. **Component test**  
   Create `*.test.tsx`:

   ```tsx
   import { render, screen } from "@testing-library/react";
   import { MyComponent } from "./MyComponent";

   describe("MyComponent", () => {
     it("renders content", () => {
       render(<MyComponent />);
       expect(screen.getByText("Hello")).toBeInTheDocument();
     });
   });
   ```

3. **API route test**  
   Mock `next/headers`, Supabase, etc.:

   ```ts
   vi.mock("@/lib/supabase", () => ({ supabaseAdmin: { ... } }));
   const res = await POST(request);
   expect(res.status).toBe(400);
   ```

## TDD Workflow

1. Write a failing test for the feature.
2. Implement the code to make it pass.
3. Refactor if needed.

## Coverage

Run `npm run test:coverage` to generate a coverage report in `coverage/` and enforce minimum global coverage (lines, statements, functions, branches). Raise thresholds gradually as you add tests.
