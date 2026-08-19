"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, Command, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type:"error"|"success";text:string}|null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage(null);
    const supabase = createClient();
    if (!supabase) { setMessage({type:"error",text:"Supabase não configurado."}); setLoading(false); return; }
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { full_name: name, organization_name: "Last One Company" } } });
      if (error) setMessage({type:"error",text:translateError(error.message)});
      else if (data.session) window.location.href = "/dashboard";
      else setMessage({type:"success",text:"Conta criada. Verifique seu e-mail para confirmar o acesso."});
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({type:"error",text:translateError(error.message)});
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  return <main className="auth-page">
    <section className="auth-brand-panel">
      <div className="auth-brand"><span><Command size={21}/></span><strong>CENTRAL <b>LAST ONE</b></strong></div>
      <div className="auth-promise"><small>AGENCY OPERATING SYSTEM</small><h1>Controle a operação.<br/><em>Antecipe o crescimento.</em></h1><p>Clientes, retenção, receita e execução reunidos em uma central operacional.</p><ul><li><Check/>Indicadores executivos em tempo real</li><li><Check/>Risco e renovações sob controle</li><li><Check/>Operação organizada para escalar</li></ul></div>
      <div className="auth-security"><ShieldCheck/><span><strong>Ambiente protegido</strong><small>Dados isolados por organização</small></span></div>
    </section>
    <section className="auth-form-panel"><div className="auth-form-wrap">
      <div className="auth-mobile-logo"><Command size={18}/>CENTRAL <b>LAST ONE</b></div>
      <span className="auth-kicker">ACESSO RESTRITO</span><h2>{mode === "login" ? "Bem-vindo de volta" : "Criar acesso administrador"}</h2><p>{mode === "login" ? "Entre para acessar o centro de comando da agência." : "Configure o primeiro acesso seguro à Central Last One."}</p>
      <form onSubmit={submit}>
        {mode === "signup" && <label>Nome completo<div className="auth-field"><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" autoComplete="name"/></div></label>}
        <label>E-mail corporativo<div className="auth-field"><Mail/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com.br" autoComplete="email"/></div></label>
        <label>Senha<div className="auth-field"><LockKeyhole/><input required minLength={8} type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete={mode==="login"?"current-password":"new-password"}/><button type="button" aria-label="Mostrar senha" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>
        {mode === "login" && <div className="auth-options"><label><input type="checkbox"/> Manter conectado</label><a href="/forgot-password">Esqueci minha senha</a></div>}
        {message && <div className={`auth-message ${message.type}`}>{message.text}</div>}
        <button className="auth-submit" disabled={loading}>{loading?"Aguarde...":mode==="login"?"Entrar na Central":"Criar minha conta"}<ArrowRight/></button>
      </form>
      <div className="auth-switch">{mode==="login"?"Primeiro acesso?":"Já possui acesso?"} <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage(null)}}>{mode==="login"?"Criar administrador":"Entrar"}</button></div>
    </div></section>
  </main>;
}

function translateError(message:string){ if(message.toLowerCase().includes("email not confirmed")) return "Seu cadastro foi criado, mas o e-mail ainda não foi confirmado. Abra a mensagem enviada pelo Supabase e clique no link de confirmação."; if(message.includes("Invalid login")) return "E-mail ou senha incorretos."; if(message.includes("already registered")) return "Este e-mail já possui uma conta. Confirme o e-mail recebido ou entre com sua senha."; if(message.includes("Password")) return "A senha deve ter pelo menos 8 caracteres."; return "Não foi possível concluir. Tente novamente."; }
