# Central Last One

Central de gestão multiempresa para organizar clientes, Health Score, renovações, onboarding, operação, CRM e financeiro da Last One Company.

## Primeira entrega

- Base Next/React/TypeScript/Tailwind com interface premium e responsiva.
- Dashboard executivo navegável em modo demonstração.
- Modelagem PostgreSQL para os módulos prioritários.
- Isolamento multi-tenant com Row Level Security.
- Cliente Supabase preparado para ativação por variáveis de ambiente.
- Tipos centrais e diretório reservado para integrações futuras.

## Stack

Next.js App Router (compatibilidade via Vinext), React, TypeScript, Tailwind CSS, Supabase/PostgreSQL, Supabase Auth, Lucide Icons, Recharts, Zod.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Supabase

1. Crie um projeto no Supabase.
2. Copie `.env.example` para `.env.local` e preencha URL, anon key e service role key.
3. Execute `supabase/migrations/202608180001_initial_schema.sql` no SQL Editor.
4. Crie o primeiro usuário em Authentication > Users.
5. Edite `supabase/seed.sql`, acrescente um registro em `profiles` usando o UUID do usuário e execute o seed.

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no navegador. A service role deve existir apenas em rotas e serviços de servidor.

## Arquitetura

```text
app/                    páginas e layouts
components/             componentes reutilizáveis por domínio
lib/supabase/           clientes browser/server do Supabase
lib/integrations/       adapters de integrações futuras
services/               regras de negócio e acesso a dados
types/                  contratos TypeScript
supabase/migrations/    schema versionado e RLS
supabase/seed.sql       dados iniciais de desenvolvimento
```

Todas as tabelas de negócio carregam `organization_id`. A função `current_organization_id()` resolve a organização pelo usuário autenticado e as policies de RLS bloqueiam leitura e escrita fora do tenant. Perfis administrativos deverão receber policies adicionais por ação na etapa de permissões granulares.

## Autenticação

O schema usa `auth.users` como origem de identidade e `profiles` como vínculo de organização e perfil de acesso. O fluxo inclui cadastro do primeiro administrador, confirmação por e-mail, login, logout, recuperação de senha, persistência de sessão e proteção do dashboard. O gatilho `handle_new_user()` cria a organização, o perfil administrador e os pesos iniciais do Health Score no primeiro cadastro.

## Migrations e seed

O SQL inicial é idempotente apenas para uma base nova. Em produção, cada alteração deve gerar uma nova migration; não edite uma migration já aplicada. O seed contém somente estrutura mínima e não inventa resultados reais da agência.

## Deploy

Configure as três variáveis do `.env.example` no provedor, rode `npm run build` e publique a saída compatível com o runtime escolhido. Para produção, configure URLs de redirect do Supabase Auth e revise as policies com testes de tenants distintos.

## Próximos passos

1. Implementar permissões granulares por papel.
2. Implementar CRUD de clientes e histórico de Health Score.
3. Implementar renovações e Kanban de onboarding.
4. Adicionar CRM, financeiro, equipe e seed completo de demonstração.
5. Integrar auditoria, testes e observabilidade.
