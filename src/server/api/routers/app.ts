import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appIndexRouter = createTRPCRouter({
  authCallback: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    const { user, db } = ctx;

    if (!user?.id || !user?.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }
    try {
      if (user.email) {
        await ensureUserInDatabase({ id: user.id, email: user.email }, db);
      }
      return { success: true };
    } catch (error) {
      console.error("Error in authCallback:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process auth callback",
      });
    }
  }),
});

async function ensureUserInDatabase(
  user: { id: string; email: string },
  db: PrismaClient,
) {
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    await db.user.create({
      data: {
        id: user.id,
        email: user.email,
      },
    });
  }
}
