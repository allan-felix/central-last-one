import { createClient } from "@/lib/supabase/server";

export async function context(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Não autenticado");const{data:profile}=await supabase.from("profiles").select("id,organization_id,full_name,role").eq("id",user.id).single();if(!profile)throw new Error("Perfil não encontrado");return{supabase,user,profile}}
