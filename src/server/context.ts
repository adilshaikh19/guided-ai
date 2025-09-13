import { inferAsyncReturnType } from "@trpc/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";

export async function createContext(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  let user = null;

  if (cookieHeader) {
    const authToken = cookieHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
        user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      } catch {
        user = null;
      }
    }
  }

  return { user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
