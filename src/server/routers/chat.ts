import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/utils/prisma";
import { TRPCError } from "@trpc/server";

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};


// Basic prompt to align AI as a career counselor
const SYSTEM_PROMPT = `You are an experienced AI Career Counselor. Provide actionable, empathetic, and practical guidance on careers, skills, resumes, job search strategy, interview preparation, and growth planning. Ask clarifying questions when needed and keep responses concise but thorough.`;

async function generateWithGemini(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  // Convert messages to Gemini input format (using text-only prompts)
  const parts = [
    { text: SYSTEM_PROMPT },
    ...messages.map((m) => ({ text: `${m.role.toUpperCase()}: ${m.content}` })),
  ];

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as GeminiResponse;
  const candidate = data?.candidates?.[0];
  const reply = candidate?.content?.parts?.map((p: GeminiPart) => p?.text).join("") ?? "";
  return reply.trim() || "I’m sorry, I couldn’t generate a response right now.";
}

export const chatRouter = router({
  // 1) Create a new session
  createSession: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = await prisma.chatSession.create({
        data: { name: input.name, userId: ctx.user.id },
      });
      return session;
    }),

  // 2) List sessions with pagination
  listSessions: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input;
      const where = { userId: ctx.user.id };
      const [items, total] = await Promise.all([
        prisma.chatSession.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.chatSession.count({ where }),
      ]);
      return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }),

  // 3) Get messages of a session with pagination
  getMessages: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { sessionId, page, pageSize } = input;

      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (session?.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [items, total] = await Promise.all([
        prisma.message.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.message.count({ where: { sessionId } }),
      ]);
      return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }),

  // 4) Send a message (creates session if needed), persists both user & AI messages, and returns AI reply
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message cannot be empty"),
        sessionId: z.string().optional(),
        // Optional name used if a new session is created
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, sessionId } = input;
      const { user } = ctx;

      // Upsert session
      let session = null as null | { id: string };
      if (sessionId) {
        const existingSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (existingSession?.userId !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        session = existingSession;
      }
      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            name: input.name?.trim() || "Career Counseling Session",
            userId: user.id,
          },
          select: { id: true },
        });
      }

      // Persist user message
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: "USER",
          content: message,
        },
      });

      // Build recent context (last 15 messages)
      const recent = await prisma.message.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: "asc" },
        take: 30,
      });

      const payload: { role: "user" | "assistant"; content: string }[] = recent.map((m) => ({
        role: m.role === "USER" ? "user" : "assistant" as const,
        content: m.content,
      }));

      // Generate AI reply
      const reply = await generateWithGemini(payload);

      // Persist assistant reply and bump session updatedAt
      await prisma.$transaction([
        prisma.message.create({
          data: {
            sessionId: session.id,
            role: "ASSISTANT",
            content: reply,
          },
        }),
        prisma.chatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } }),
      ]);

      return { sessionId: session.id, reply };
    }),
});

