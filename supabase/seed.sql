-- Execute após criar um usuário em Authentication > Users.
-- Substitua o UUID abaixo pelo auth.users.id real antes de executar.
insert into public.organizations (id,name,slug) values ('11111111-1111-1111-1111-111111111111','Last One Company','last-one-company');
insert into public.plans (organization_id,name,monthly_price) values
('11111111-1111-1111-1111-111111111111','Performance','2900'),
('11111111-1111-1111-1111-111111111111','Growth','3800'),
('11111111-1111-1111-1111-111111111111','Scale','5200');
insert into public.health_score_settings (organization_id) values ('11111111-1111-1111-1111-111111111111');
