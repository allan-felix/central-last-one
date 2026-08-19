import { AlertTriangle, Building2, CalendarClock, Clock3, HeartPulse, TrendingUp, Users } from "lucide-react";

export const metrics = [
  { label: "Clientes ativos", value: "94", change: "+6,8%", positive: true, tone: "blue", icon: Building2 },
  { label: "MRR", value: "R$ 236.420", change: "+8,4%", positive: true, tone: "green", icon: TrendingUp },
  { label: "MRR em risco", value: "R$ 28.600", change: "+2,1%", positive: false, tone: "red", icon: AlertTriangle },
  { label: "Renovações · 30d", value: "7", change: "R$ 19.300", positive: true, tone: "yellow", icon: CalendarClock },
] as const;
export const mrrHistory = [{month:"Set",value:168000},{month:"Out",value:176500},{month:"Nov",value:181000},{month:"Dez",value:179500},{month:"Jan",value:192400},{month:"Fev",value:201800},{month:"Mar",value:207200},{month:"Abr",value:215600},{month:"Mai",value:218900},{month:"Jun",value:226400},{month:"Jul",value:230100},{month:"Ago",value:236420}];
export const priorities = [
  { count: 7, label: "contratos vencendo", description: "Nos próximos 30 dias", tone: "yellow", icon: CalendarClock },
  { count: 4, label: "clientes críticos", description: "Health Score abaixo de 60", tone: "red", icon: HeartPulse },
  { count: 5, label: "reuniões pendentes", description: "Sem contato há mais de 20 dias", tone: "blue", icon: Users },
  { count: 6, label: "tarefas atrasadas", description: "Precisam de ação hoje", tone: "purple", icon: Clock3 },
] as const;
export const clients = [
  {id:"1",initials:"VF",name:"Farmácia Vita Fórmula",city:"Campinas, SP",manager:"Mariana Costa",mrr:"R$ 3.800",renewal:"12 dias",health:42,status:"Em risco"},
  {id:"2",initials:"EP",name:"Essenza Manipulação",city:"Curitiba, PR",manager:"Lucas Mendes",mrr:"R$ 2.900",renewal:"18 dias",health:58,status:"Em risco"},
  {id:"3",initials:"MP",name:"Manipulare Prime",city:"Goiânia, GO",manager:"Mariana Costa",mrr:"R$ 4.200",renewal:"27 dias",health:67,status:"Ativo"},
  {id:"4",initials:"BF",name:"BioFarma Magistral",city:"Recife, PE",manager:"Rafael Lima",mrr:"R$ 3.250",renewal:"34 dias",health:74,status:"Ativo"},
  {id:"5",initials:"FL",name:"Fórmula Lab",city:"Belo Horizonte, MG",manager:"Camila Rocha",mrr:"R$ 3.600",renewal:"41 dias",health:82,status:"Ativo"},
];
