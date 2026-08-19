import DashboardShell from "@/components/dashboard/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
  return <DashboardShell userName={userName} userEmail={user.email || "Administrador"} />;
}
