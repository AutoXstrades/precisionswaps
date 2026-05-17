import { redirect } from "next/navigation";

type AuthLoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function AuthLoginAliasPage({
  searchParams,
}: AuthLoginPageProps) {
  const { callbackUrl } = await searchParams;
  const destination = new URL("/login", "http://localhost");

  if (callbackUrl) {
    destination.searchParams.set("callbackUrl", callbackUrl);
  }

  redirect(`${destination.pathname}${destination.search}`);
}
