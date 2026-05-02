import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * Root: send to dashboard if signed in, otherwise to login.
 * Plan-gate is enforced inside the (academy) layout.
 */
export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect("/dashboard");
}
