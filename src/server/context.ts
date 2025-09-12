import { inferAsyncReturnType } from "@trpc/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";
import { cookies } from 'next/headers';

export async function createContext() {
  async function getUserFromCookie() {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }
  const user = await getUserFromCookie();
  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
