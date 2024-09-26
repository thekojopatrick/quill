import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

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

  getUserFiles: protectedProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    return await db.file.findMany({ where: { id: userId } });
  }),

  getFileUploadStatus: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await ctx.db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getFile: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  deleteFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
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
