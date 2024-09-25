"use client";

import { useRouter, useSearchParams } from "next/navigation";

import React from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  return <div>page</div>;
};

export default Page;
