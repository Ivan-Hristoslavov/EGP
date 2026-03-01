# Testing Guide (TDD-style)

This project uses **Vitest** for unit and integration tests, with **React Testing Library** for components.

## Commands

```bash
npm run test        # Watch mode - re-runs on file changes
npm run test:run    # Single run (CI)
npm run test:coverage  # Coverage report
```

## Test Structure

Tests live next to the code they test:

- `config/typography.test.ts` → tests `config/typography.ts`
- `lib/image-utils.test.ts` → tests `lib/image-utils.ts`
- `components/ButtonPrimary.test.tsx` → tests `components/ButtonPrimary.tsx`
- `app/api/admin/auth/route.test.ts` → tests API route

## What's Tested

| Layer | Examples |
|-------|----------|
| **Config** | typography tokens, layout |
| **Lib** | image-utils, stripe constants, email-theme |
| **Components** | ButtonPrimary, others |
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

Run `npm run test:coverage` to generate a coverage report in `coverage/`.
