# Redefinição administrativa de senha

O fluxo usa duas Edge Functions. A chave `service_role` é lida apenas no ambiente das funções e não deve ser adicionada ao Blazor, ao repositório ou a arquivos publicados.

Depois de revisar a migração e autenticar a Supabase CLI:

```powershell
supabase link --project-ref zzkuzsfxzfeyvinasgic
supabase db push
supabase functions deploy create-user-account
supabase functions deploy reset-user-password
supabase functions deploy change-own-password
```

O projeto precisa disponibilizar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` às Edge Functions. No Supabase hospedado, essas são variáveis padrão do runtime. Não coloque a chave em `appsettings.json`, `Program.cs` ou no frontend.

O cadastro na tela Admin chama `create-user-account`. A função confirma a sessão e o perfil `Admin`, cria a conta em Supabase Auth com a senha provisória informada, e vincula seu UUID ao perfil em `public.usuarios`. A senha não é gravada na tabela da aplicação. A migration `202610080002_auth_passwords_only.sql` torna a coluna legada `senha` opcional. O e-mail é usado apenas como identificador de login e é confirmado sem envio de mensagem.

No primeiro login, `app_metadata.require_password_change` força o usuário a definir uma senha pessoal. Para uma senha esquecida, a tela Gestão de Senhas chama `reset-user-password`; a função troca a senha no Auth, marca novamente a exigência de troca e grava auditoria. A senha temporária aparece uma vez na tela; entregue-a por um canal interno seguro.
