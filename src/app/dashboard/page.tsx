import {
  LogoutLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";

import React from "react";
import { api } from "@/trpc/server";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const intro = await api.post.intro();

  if (!user ?? !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  return (
    <div className="container py-4">
      <h1>{intro.greeting}</h1>
      <LogoutLink>Logout</LogoutLink>
    </div>
  );
};

export default Page;
