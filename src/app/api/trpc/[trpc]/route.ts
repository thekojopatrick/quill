import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * This creates the context for the tRPC API, including KindeAuth session.
 */
const createContext = async (req: NextRequest) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return createTRPCContext({
    headers: req.headers,
    user,
    // You can add more context properties here if needed
  });
};

const handler = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
