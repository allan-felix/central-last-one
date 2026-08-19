import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request){
 const session=await createClient();const{data:{user}}=await session.auth.getUser();if(!user)return NextResponse.json({error:"Não autenticado."},{status:401});
 const{data:profile}=await session.from("profiles").select("organization_id,role").eq("id",user.id).single();if(!profile||profile.role!=="admin")return NextResponse.json({error:"Somente administradores podem criar usuários."},{status:403});
 const body=await request.json();if(body.organizationId!==profile.organization_id)return NextResponse.json({error:"Organização inválida."},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:"Serviço de convites não configurado."},{status:500});
 const admin=createAdminClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});const origin=new URL(request.url).origin;const{data,error}=await admin.auth.admin.inviteUserByEmail(body.email,{redirectTo:`${origin}/auth/callback?next=/reset-password`,data:{full_name:body.fullName}});if(error||!data.user)return NextResponse.json({error:error?.message||"Não foi possível enviar o convite."},{status:400});
 const{data:created}=await admin.from("profiles").select("organization_id").eq("id",data.user.id).single();await admin.from("profiles").update({organization_id:profile.organization_id,full_name:body.fullName,job_title:body.jobTitle,role:body.role,active:true}).eq("id",data.user.id);if(created?.organization_id&&created.organization_id!==profile.organization_id)await admin.from("organizations").delete().eq("id",created.organization_id);
 return NextResponse.json({user:{id:data.user.id,full_name:body.fullName,email:body.email,job_title:body.jobTitle,role:body.role,active:true}});
}
