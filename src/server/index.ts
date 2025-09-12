import { router } from './trpc';
import { greetingRouter } from './routers/greetings';
import { chatRouter } from './routers/chat';
import { authRouter } from './routers/auth'; // 1. Import authRouter

export const appRouter = router({
  greeting: greetingRouter,
  chat: chatRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;