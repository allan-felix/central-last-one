"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3,
  Bell, Building2, CalendarClock, ChevronDown,
  ClipboardCheck, Command, Gauge,
  LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck,
  Sparkles, Target, Users, WalletCards, X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { clients, metrics, mrrHistory, priorities } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  ["Dashboard", LayoutDashboard], ["Clientes", Building2], ["Renovações", CalendarClock],
  ["Onboarding", ClipboardCheck], ["Operação", Gauge], ["CRM", Target],
  ["Financeiro", WalletCards], ["Equipe", Users], ["Configurações", Settings],
] as const;

function HealthBadge({ score }: { score: number }) {
  const tone = score >= 80 ? "healthy" : score >= 60 ? "attention" : "critical";
  const label = score >= 80 ? "Saudável" : score >= 60 ? "Atenção" : "Crítico";
  return <span className={`health ${tone}`}><i />{score} · {label}</span>;
}

export default function DashboardShell({ userName }: { userName: string; userEmail: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const filtered = useMemo(() => clients.filter((client) => client.name.toLowerCase().includes(query.toLowerCase())), [query]);

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    window.location.href = "/login";
  }

  function navigate(label: string) {
    setActive(label);
    setSidebarOpen(false);
    if (label !== "Dashboard") {
      setToast(`${label} está estruturado para a próxima etapa do MVP.`);
      window.setTimeout(() => setToast(null), 2600);
    }
  }

  return (
    <div className="dashboard-inner">
      <aside className={cn("sidebar dashboard-legacy-sidebar", sidebarOpen && "open")}>
        <div className="brand"><div className="brand-mark"><Command size={19} /></div><div><strong>CENTRAL</strong><span>LAST ONE</span><small>Gestão da operação</small></div></div>
        <nav aria-label="Navegação principal">
          <p className="nav-label">Workspace</p>
          {navigation.map(([label, Icon]) => (
            <button key={label} className={cn("nav-item", active === label && "active")} onClick={() => navigate(label)}>
              <Icon size={18} /><span>{label}</span>{label === "Renovações" && <b>7</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="company-pill"><ShieldCheck size={17}/><div><span>Last One Company</span><small>Workspace principal</small></div></div>
          <button className="profile-button" onClick={signOut} title="Sair da conta">
            <span className="avatar">{userName.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase()}</span><div><strong>{userName}</strong><small>Administrador</small></div><ChevronDown size={15}/>
          </button>
        </div>
      </aside>
      {sidebarOpen && <button className="backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-main-inner">
        <header className="topbar dashboard-legacy-topbar">
          <button className="menu-button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div className="top-title"><span>Visão executiva</span><small>Terça-feira, 18 de agosto</small></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notificações"><Bell size={18}/><i/></button><button className="primary-button" onClick={() => setToast("Cadastro de cliente será conectado ao Supabase na próxima etapa.")}><Plus size={17}/>Novo cliente</button></div>
        </header>

        <div className="content">
          <section className="hero-row">
            <div><div className="eyebrow"><Sparkles size={14}/> CENTRO DE COMANDO</div><h1>Boa tarde, {userName.split(" ")[0]}.</h1><p>Visão consolidada da operação, retenção e crescimento da agência.</p></div>
            <button className="period-button">Últimos 30 dias <ChevronDown size={15}/></button>
          </section>

          <section className="metrics-grid" aria-label="Indicadores principais">
            {metrics.map((metric) => <article className="metric-card" key={metric.label}>
              <div className="metric-head"><span className={`metric-icon ${metric.tone}`}><metric.icon size={18}/></span><button aria-label={`Mais opções para ${metric.label}`}><MoreHorizontal size={17}/></button></div>
              <span className="metric-label">{metric.label}</span><strong>{metric.value}</strong>
              <div className={cn("metric-change", metric.positive ? "up" : "down")}>{metric.positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {metric.change}<small>vs mês anterior</small></div>
            </article>)}
          </section>

          <section className="dashboard-grid">
            <article className="panel chart-panel">
              <div className="panel-header"><div><span className="panel-kicker">RECEITA RECORRENTE</span><h2>Evolução do MRR</h2></div><div className="legend"><i/>MRR acumulado</div></div>
              <div className="chart-summary"><strong>R$ 236.420</strong><span><ArrowUpRight size={14}/> 8,4%</span></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={mrrHistory} margin={{ left: 2, right: 8, top: 16, bottom: 0 }}><defs><linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#72ff00" stopOpacity={0.28}/><stop offset="100%" stopColor="#72ff00" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1c2a3e" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71809a", fontSize: 11 }}/><Tooltip contentStyle={{ background: "#101b2b", border: "1px solid #24354c", borderRadius: 10, color: "#fff" }} formatter={(value) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "MRR"]}/><Area type="monotone" dataKey="value" stroke="#72ff00" strokeWidth={2.5} fill="url(#mrr)"/></AreaChart></ResponsiveContainer></div>
            </article>
            <article className="panel priorities-panel"><div className="panel-header"><div><span className="panel-kicker">FOCO OPERACIONAL</span><h2>Prioridades de hoje</h2></div><button>Ver todas</button></div><div className="priority-list">{priorities.map((p) => <button key={p.label} onClick={() => setToast(`${p.count} ${p.label.toLowerCase()} — filtro aplicado.`)}><span className={`priority-icon ${p.tone}`}><p.icon size={17}/></span><div><strong>{p.count} {p.label}</strong><small>{p.description}</small></div><span className="priority-arrow">→</span></button>)}</div></article>
          </section>

          <section className="panel clients-panel">
            <div className="panel-header clients-header"><div><span className="panel-kicker">CARTEIRA</span><h2>Clientes que exigem atenção</h2></div><div className="table-tools"><label><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente" aria-label="Buscar cliente"/></label><button onClick={() => setToast("Filtros avançados entram no módulo Clientes.")}><BarChart3 size={16}/>Filtrar</button></div></div>
            <div className="table-scroll"><table><thead><tr><th>Cliente</th><th>Gestor</th><th>MRR</th><th>Renovação</th><th>Health Score</th><th>Status</th></tr></thead><tbody>{filtered.map((client) => <tr key={client.id} onClick={() => setToast(`Perfil de ${client.name} será aberto no módulo Clientes.`)}><td><div className="client-name"><span>{client.initials}</span><div><strong>{client.name}</strong><small>{client.city}</small></div></div></td><td>{client.manager}</td><td><strong>{client.mrr}</strong></td><td>{client.renewal}</td><td><HealthBadge score={client.health}/></td><td><span className={`status ${client.status === "Em risco" ? "risk" : "active"}`}>{client.status}</span></td></tr>)}</tbody></table></div>
            <div className="table-footer"><span>Exibindo {filtered.length} de 30 clientes</span><button onClick={() => navigate("Clientes")}>Ver carteira completa →</button></div>
          </section>
        </div>
      </main>
      {toast && <div className="toast"><Activity size={17}/>{toast}<button aria-label="Fechar aviso" onClick={() => setToast(null)}><X size={15}/></button></div>}
    </div>
  );
}
