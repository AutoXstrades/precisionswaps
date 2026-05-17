import { redirect } from "next/navigation";

type BuildAliasPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BuildIdAliasPage({ params }: BuildAliasPageProps) {
  const { id } = await params;
  redirect(`/builds/${id}`);
}
