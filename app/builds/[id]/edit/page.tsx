import { notFound } from "next/navigation";
import { BuildEditForm } from "@/components/builds/BuildEditForm";
import { getBuildForEdit, requireCustomer } from "@/lib/customer";

type EditBuildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = await params;
  const session = await requireCustomer();
  const build = await getBuildForEdit(id, session.user.id);

  if (!build) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FF003C]">
          Edit build
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">
          {build.vehicleYear} {build.vehicleMake} {build.vehicleModel}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/68">
          Update the customer-facing build ticket details and estimate range.
        </p>
      </div>
      <BuildEditForm build={build} />
    </section>
  );
}
