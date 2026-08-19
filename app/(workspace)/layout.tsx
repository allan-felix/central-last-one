import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export default async function WorkspaceLayout({children}:{children:ReactNode}){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");const{data:profile}=await supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle();const name=profile?.full_name||user.user_metadata?.full_name||"Usuário";return <AppShell userName={name} userEmail={user.email||"Administrador"}>{children}</AppShell>}
