import { ConfigBuilder } from "@/components/config-builder/config-builder";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function BuilderPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <ConfigBuilder />;
}
