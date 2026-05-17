import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

type PrecisionSwapsRole = "CUSTOMER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: PrecisionSwapsRole;
  }

  interface Session {
    user: {
      id: string;
      role: PrecisionSwapsRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: PrecisionSwapsRole;
  }
}
