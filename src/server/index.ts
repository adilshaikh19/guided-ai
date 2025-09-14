import { router } from './trpc';
import { chatRouter } from './routers/chat';
import { authRouter } from './routers/auth'; // 1. Import authRouter

export const appRouter = router({
  chat: chatRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;