/**
 * Plan gating: only users on Growth or Growth+ can access ZapAcademy.
 * Configurable via ACADEMY_ALLOWED_PLANS (comma-separated).
 */
export function getAllowedPlans(): string[] {
  const raw = process.env.ACADEMY_ALLOWED_PLANS || "growth,growth_plus,advanced,enterprise,explore,trial";
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlanAllowed(plan: string | null | undefined): boolean {
  if (!plan) return false;
  return getAllowedPlans().includes(plan.toLowerCase());
}

export function planLabel(plan: string | null | undefined): string {
  if (!plan) return "No active plan";
  const map: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    growth: "Growth",
    growth_plus: "Growth+",
    advanced: "Advanced",
    enterprise: "Enterprise",
    trial: "Trial",
    explore: "Explore",
  };
  return map[plan.toLowerCase()] || plan;
}
