# Oration Assignment — Comprehensive Documentation

## Overview

This is a Next.js (App Router) application with TRPC, Prisma, and a simple chat experience supporting authentication, session-based conversations, and UX enhancements. Key implemented features:

- **URL session persistence**: Current chat session ID is reflected in the URL (`?sessionId=...`) to support reloads and deep linking.
- **Chat loading overlay**: Visual loading state while messages are fetched.
- **Auth UX improvements**: Loading/disabled states, error handling for login/registration.
- **Delete chat sessions**: Secure backend mutation with ownership checks and UI integration in the sidebar.

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **API**: tRPC
- **ORM/DB**: Prisma + (your configured database via `.env`)
- **UI**: React + Tailwind CSS
- **Runtime**: Node.js

## Project Structure

```
./
├─ src/
│  ├─ app/                  # Next.js App Router
│  │  ├─ chat/              # Chat page, Sidebar, chat UI
│  │  ├─ login/             # Login/Register page
│  │  ├─ _trpc/             # TRPC provider utilities
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/           # Reusable UI components
│  ├─ lib/                  # Utilities (e.g., className helpers)
│  ├─ server/
│  │  ├─ routers/           # tRPC routers (chat, auth)
│  │  ├─ context.ts         # tRPC context (session, prisma, etc.)
│  │  ├─ index.ts           # App router composition
│  │  └─ trpc.ts            # tRPC init
│  └─ utils/                # prisma and trpc client setup
├─ prisma/
│  ├─ schema.prisma         # Data model
│  └─ migrations/           # Migration history
├─ public/                  # Static assets
├─ .env                     # Environment variables (not committed)
└─ DOCUMENTATION.md         # This file
```

## Environment Setup

1. **Prerequisites**

   - Node.js LTS (v18+ recommended)
   - A database supported by Prisma (e.g., PostgreSQL)

2. **Environment variables**

   - Create `.env` at the project root. Typical variables:
     - `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"`
     - Any auth/session secrets as required by your auth strategy

3. **Install dependencies**

   ```bash
   npm install
   # or yarn / pnpm / bun
   ```

4. **Database & Prisma**
   - Generate client and apply migrations:
     ```bash
     npx prisma generate
     npx prisma migrate dev
     ```
   - Optional: open Prisma Studio
     ```bash
     npx prisma studio
     ```

## Development

- Start the dev server:
  ```bash
  npm run dev
  ```
- Visit http://localhost:3000

## Build & Run

- Production build and start:
  ```bash
  npm run build
  npm run start
  ```

## Application Architecture

- **Next.js App Router** handles routing and server components where suitable.
- **tRPC** provides type-safe API routes without REST boilerplate.
- **Prisma** manages schema, migrations, and typed DB access.
- **Auth** is implemented via server-side logic in tRPC routers (see `authRouter`).

## Key Features & Flows

### 1) Chat Session URL Persistence

- The chat page syncs selected session with `?sessionId=...` using Next navigation hooks.
- On page load, if `sessionId` exists, it restores the corresponding session.
- Changing the selected session updates the URL via `router.replace` without a full navigation.
- File: `src/app/chat/ChatPage.tsx`

### 2) Loading Overlay for Messages

- While fetching messages for the selected session, a spinner overlay is shown in the chat area.
- Improves UX by indicating background activity.
- File: `src/app/chat/ChatPage.tsx`

### 3) Auth UX (Login/Registration)

- Buttons/inputs are disabled while a request is in-flight.
- Button text shows progress (e.g., “Logging in…”, “Registering…”).
- Errors are displayed clearly with server-provided messages or sensible fallbacks.
- Prevents toggling modes during submission to avoid state confusion.
- File: `src/app/login/page.tsx`

### 4) Delete Chat Sessions

- Backend mutation `chat.deleteSession` enforces ownership and deletes messages + session in a transaction.
- UI: Trash icon button per session; confirmation prompt, per-item spinner, refresh list.
- If the deleted session was active, the selection is cleared and URL is updated.
- Files: `src/server/routers/chat.ts`, `src/app/chat/Sidebar.tsx`

## tRPC Routers

- `src/server/index.ts` composes the app router:
  - **chat**: message/session CRUD-like operations, including `deleteSession`.
  - **auth**: login/registration mutations with validation and errors.

### Example: chat.deleteSession

- Input: `{ sessionId: string }`
- Auth: requires authenticated user; validates the session belongs to the user
- Behavior: within a transaction, deletes session messages then the session
- Returns: `{ ok: true }` on success

## Data Model (Prisma)

- See `prisma/schema.prisma` for exact models. Typical entities include:
  - **User**: application user
  - **ChatSession**: user-owned session
  - **Message**: linked to a `ChatSession`

## Error Handling & Loading States

- Chat message fetching displays loading overlay.
- Auth forms provide inline errors and disable controls during mutations.
- Deleting sessions shows an inline spinner and confirmation.

## Security Considerations

- Sensitive operations like `deleteSession` verify ownership.
- Ensure `.env` is not committed. Rotate secrets if exposed.
- Apply least-privilege DB credentials in production.

## Scripts

- `dev`: start development server
- `build`: create production build
- `start`: run production server
- Prisma helpers (`generate`, `migrate`, `studio`) via `npx prisma ...`

## Testing (Suggested)

- Unit test routers and utils (e.g., using Vitest/Jest).
- E2E smoke test critical flows (login, create session, send message, delete session).

## Deployment

- Recommended: Vercel for Next.js. Ensure `DATABASE_URL` and auth secrets are configured in the host environment.
- Run migrations on deployment (e.g., via CI/CD or a prestart step).

## Troubleshooting

- **Prisma client errors**: Run `npx prisma generate` and verify `DATABASE_URL`.
- **Migrations fail**: Check DB permissions and existing state; consider `npx prisma migrate reset` for local.
- **Auth issues**: Confirm session creation, cookies, or token handling in tRPC context.
- **Deep link to chat not restoring**: Verify the URL has `?sessionId=` and that the session exists for the user.

## Future Improvements

- Switch to dynamic route `/chat/[sessionId]` for cleaner URLs.
- Toast notifications for destructive actions and auth messages.
- Optimistic UI for deletes with rollback.
- Field-level validations in auth forms.
- Role-based or feature-based access control for advanced scenarios.

---

If you’d like, I can also regenerate a richer root README by merging this content, or add a CHANGELOG to track future changes.
