import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const greetingRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        text: `Hello, ${input.name}!`,
      };
    }),
});