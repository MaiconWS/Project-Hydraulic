import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonResponse({ error: "Sessão inválida." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Configuração segura do Supabase indisponível." }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerResult, error: callerError } = await adminClient.auth.getUser(token);
  const caller = callerResult.user;
  if (callerError || !caller) return jsonResponse({ error: "Sessão inválida." }, 401);

  let newPassword: string;
  try {
    const body = await request.json();
    newPassword = String(body?.newPassword ?? "");
  } catch {
    return jsonResponse({ error: "Dados da solicitação inválidos." }, 400);
  }
  if (newPassword.length < 12 || newPassword.length > 128) {
    return jsonResponse({ error: "A senha deve ter entre 12 e 128 caracteres." }, 400);
  }

  const { data: targetResult, error: targetError } = await adminClient.auth.admin
    .getUserById(caller.id);
  const target = targetResult.user;
  if (targetError || !target) return jsonResponse({ error: "Conta não encontrada." }, 404);
  if (target.app_metadata?.require_password_change !== true) {
    return jsonResponse({ error: "A conta não está aguardando troca de senha." }, 403);
  }

  const appMetadata = {
    ...(target.app_metadata ?? {}),
    require_password_change: false,
  };
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    caller.id,
    { password: newPassword, app_metadata: appMetadata },
  );
  if (updateError) return jsonResponse({ error: "Não foi possível alterar a senha." }, 500);

  return jsonResponse({ ok: true });
});
