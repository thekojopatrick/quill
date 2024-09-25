"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useEffect } from "react";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isLoading, isError, error } = api.app.authCallback.useQuery(
    undefined,
    {
      retry: true,
      retryDelay: 500,
    },
  );

  useEffect(() => {
    if (isError) {
      // Handle non-UNAUTHORIZED errors here if needed
      console.error("An error occurred during authentication");
    }
  }, [isError]);

  if (data?.success) {
    router.push(origin ? `/${origin}` : "/dashboard");
  }

  if (error) {
    if (error.data?.code === "UNAUTHORIZED") {
      router.push("/sign-in");
    }
  }

  if (isLoading || isError) {
    return (
      <div className="mt-24 flex w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <h3 className="text-xl font-semibold">
            {isLoading ? "Setting up your account..." : "Authentication error"}
          </h3>
          <p>
            {isLoading
              ? "You will be redirected automatically."
              : "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
