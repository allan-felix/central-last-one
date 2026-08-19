"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Bell, Building2, CalendarClock, CalendarDays, ChevronDown, ClipboardCheck, Command, Gauge, LayoutDashboard, Menu, Settings, Target, Users, WalletCards } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const links=[
  ["/dashboard","Dashboard",LayoutDashboard],["/clients","Clientes",Building2],["/renewals","Renovações",CalendarClock],
  ["/onboarding","Onboarding",ClipboardCheck],["/operations","Operação",Gauge],["/crm","CRM",Target],
  ["/finance","Financeiro",WalletCards],["/agenda","Minha Agenda",CalendarDays],["/team","Equipe",Users],["/settings","Configurações",Settings],
] as const;

export default function AppShell({children,userName,userEmail}:{children:ReactNode;userName:string;userEmail:string}){
  const pathname=usePathname(); const[open,setOpen]=useState(false);
  useEffect(()=>{fetch("/api/meetings/reminders",{method:"POST"}).catch(()=>{})},[pathname]);
  async function logout(){await createClient()?.auth.signOut();location.href="/login"}
  return <div className="app-shell"><aside className={cn("sidebar",open&&"open")}>
    <Link className="brand" href="/dashboard"><div className="brand-mark"><Command size={19}/></div><div><strong>CENTRAL</strong><span>LAST ONE</span><small>Gestão da operação</small></div></Link>
    <nav><p className="nav-label">Workspace</p>{links.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={cn("nav-item",pathname===href||pathname.startsWith(`${href}/`)?"active":"")}><Icon size={18}/><span>{label}</span></Link>)}</nav>
    <div className="sidebar-bottom"><div className="company-pill"><Building2 size={17}/><div><span>Last One Company</span><small>Workspace principal</small></div></div><button className="profile-button" onClick={logout} title="Sair"><span className="avatar">{userName.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</span><div><strong>{userName}</strong><small>{userEmail}</small></div><ChevronDown size={15}/></button></div>
  </aside>{open&&<button className="backdrop" onClick={()=>setOpen(false)} aria-label="Fechar menu"/>}<main><header className="topbar"><button className="menu-button" onClick={()=>setOpen(true)} aria-label="Abrir menu"><Menu/></button><div className="top-title"><span>Central Last One</span><small>Operação em tempo real</small></div><div className="top-actions"><button className="icon-button" aria-label="Notificações"><Bell size={18}/><i/></button></div></header>{children}</main></div>
}
