import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Variáveis Supabase ausentes.");
const db = createClient(url, key, { auth: { persistSession: false } });
const { data: profiles, error: profileError } = await db.from("profiles").select("id,organization_id").limit(1);
if (profileError || !profiles?.[0]) throw new Error(profileError?.message || "Perfil não encontrado.");
const owner = profiles[0];
const org = owner.organization_id;

const planRows = [
  { organization_id: org, name: "Performance", monthly_price: 2900 },
  { organization_id: org, name: "Growth", monthly_price: 3800 },
  { organization_id: org, name: "Scale", monthly_price: 5200 },
];
await db.from("plans").upsert(planRows, { onConflict: "organization_id,name" });
const { data: plans } = await db.from("plans").select("id,name,monthly_price").eq("organization_id", org);

const names = ["Farmácia Vita Fórmula","Manipulare Prime","Essenza Manipulação","BioFarma Magistral","Fórmula Lab","Pharma Nobre","Ativa Manipulação","Equilíbrio Fórmulas","Botânica Magistral","Fórmula Viva","Essencial Pharma","Vitta Care","Magistral Santé","Farmácia Elemento","Núcleo Fórmulas","Pharmapele Centro","Vida Plena Manipulação","Origem Pharma","Fórmula Única","Essenza Vital","Bioativa Fórmulas","Pharma Concept","Manipula Mais","Fórmula Certa","Naturalize Pharma","Vivere Magistral","Pharma Select","Saúde em Fórmula","Laboratório Vitalis","Fórmula Premium"];
const cities = [["Campinas","SP"],["Curitiba","PR"],["Goiânia","GO"],["Recife","PE"],["Belo Horizonte","MG"],["Florianópolis","SC"],["Fortaleza","CE"],["Ribeirão Preto","SP"],["Salvador","BA"],["Brasília","DF"]];
const health = [42,58,67,74,82,91,55,63,86,78,48,69,88,93,61,72,57,84,76,66,90,52,73,81,64,87,45,79,68,94];
const today = new Date();
const clientRows = names.map((name, i) => {
  const plan = plans[i % plans.length]; const [city,state] = cities[i % cities.length];
  const renewal = new Date(today); renewal.setDate(today.getDate() + 7 + i * 4);
  const joined = new Date(today); joined.setMonth(today.getMonth() - (4 + i % 20));
  return { organization_id:org, name, legal_name:`${name} LTDA`, owner_name:["Ana Paula","Carlos Eduardo","Mariana Alves","Rafael Souza"][i%4], email:`contato${i+1}@exemplo.com`, whatsapp:`55119999${String(1000+i)}`, city,state,segment:"Farmácia de manipulação",plan_id:plan.id,monthly_fee:Number(plan.monthly_price),joined_at:joined.toISOString().slice(0,10),renewal_at:renewal.toISOString().slice(0,10),manager_id:owner.id,health_score:health[i],status:health[i]<60?"at_risk":"active",notes:"Dados fictícios para demonstração do MVP." };
});
const { count } = await db.from("clients").select("id",{count:"exact",head:true}).eq("organization_id",org);
if (!count) await db.from("clients").insert(clientRows);
const { data: clients } = await db.from("clients").select("id,name,monthly_fee,renewal_at,health_score").eq("organization_id",org).order("created_at").limit(30);

const { count: renewalCount } = await db.from("renewals").select("id",{count:"exact",head:true}).eq("organization_id",org);
if (!renewalCount) await db.from("renewals").insert(clients.slice(0,10).map((c,i)=>({organization_id:org,client_id:c.id,owner_id:owner.id,renewal_at:c.renewal_at,status:["not_started","contact_started","negotiation","renewed"][i%4]})));
const steps=["contract_signed","accesses","landing_page","tracking","google_ads","validation","campaign_active","completed"];
const { count: onboardingCount } = await db.from("onboarding").select("id",{count:"exact",head:true}).eq("organization_id",org);
if (!onboardingCount) await db.from("onboarding").insert(clients.slice(10,18).map((c,i)=>({organization_id:org,client_id:c.id,owner_id:owner.id,current_step:steps[i%steps.length],started_at:new Date(Date.now()-(i+2)*86400000).toISOString().slice(0,10),due_at:new Date(Date.now()+(8-i)*86400000).toISOString().slice(0,10),progress:Math.round((i+1)*12.5)})));
const crmCompanies=["Nova Fórmula","Pharma Essencial","Manipula Center","Vida Magistral","Bioequilíbrio","Fórmula Natural","Pharma One","Magistral Prime","Essenza Lab","Vitta Fórmulas","Farmácia Aurora","Nativa Pharma","Elemento Magistral","Fórmula Saúde","Ativa Pharma"];
const stages=["lead","qualified","meeting_scheduled","meeting_held","proposal_sent","follow_up","won","lost"];
const { count: leadCount }=await db.from("crm_leads").select("id",{count:"exact",head:true}).eq("organization_id",org);
if(!leadCount) await db.from("crm_leads").insert(Array.from({length:50},(_,i)=>({organization_id:org,company_name:`${crmCompanies[i%crmCompanies.length]}${i>14?` ${Math.floor(i/15)+1}`:""}`,contact_name:["Juliana Martins","Bruno Costa","Fernanda Lima","Diego Alves"][i%4],phone:`55119888${String(2000+i)}`,email:`lead${i+1}@exemplo.com`,source:["Google Ads","Indicação","Instagram","Evento"][i%4],seller_id:owner.id,segment:"Farmácia de manipulação",estimated_revenue:180000+i*5000,proposal_value:3000+(i%5)*500,potential_mrr:2900+(i%4)*700,probability:[10,25,40,55,70,80,100,0][i%8],stage:stages[i%8],next_action:"Realizar contato comercial",next_action_at:new Date(Date.now()+(i%10)*86400000).toISOString()})));
const { count: financeCount }=await db.from("financial_transactions").select("id",{count:"exact",head:true}).eq("organization_id",org);
if(!financeCount) await db.from("financial_transactions").insert(clients.map((c,i)=>({organization_id:org,client_id:c.id,description:`Mensalidade — ${c.name}`,kind:"income",amount:c.monthly_fee,payment_status:i%11===0?"overdue":i%5===0?"pending":"paid",due_at:new Date(today.getFullYear(),today.getMonth(),10+(i%12)).toISOString().slice(0,10),paid_at:i%5===0?null:new Date(today.getFullYear(),today.getMonth(),8+(i%12)).toISOString().slice(0,10)})));
const { count: taskCount }=await db.from("tasks").select("id",{count:"exact",head:true}).eq("organization_id",org);
if(!taskCount) await db.from("tasks").insert(clients.slice(0,14).map((c,i)=>({organization_id:org,client_id:c.id,assignee_id:owner.id,title:["Revisar campanha","Agendar reunião","Atualizar relatório","Preparar renovação"][i%4],due_at:new Date(Date.now()+(i-6)*86400000).toISOString(),priority:(i%4)+1,status:i%5===0?"done":"todo"})));
console.log(JSON.stringify({organization:org,clients:clients.length,seeded:true}));
