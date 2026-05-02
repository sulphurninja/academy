import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LandingPage from "./_landing";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
