import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function gerarSenhaTemporaria(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const base64 = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${base64.slice(0, 32)}aA7!`;
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

  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from("usuarios")
    .select("perfil")
    .eq("auth_user_id", caller.id)
    .maybeSingle();

  if (callerProfileError || callerProfile?.perfil !== "Admin") {
    return jsonResponse({ error: "Apenas Administradores podem redefinir senhas." }, 403);
  }

  let usuarioId: number;
  try {
    const body = await request.json();
    usuarioId = Number(body?.usuarioId);
  } catch {
    return jsonResponse({ error: "Dados da solicitação inválidos." }, 400);
  }
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    return jsonResponse({ error: "Selecione um usuário válido." }, 400);
  }

  const { data: target, error: targetError } = await adminClient
    .from("usuarios")
    .select("id, nome, auth_user_id")
    .eq("id", usuarioId)
    .maybeSingle();

  if (targetError || !target?.auth_user_id) {
    return jsonResponse({ error: "Usuário não encontrado ou sem vínculo com o Auth." }, 404);
  }
  if (target.auth_user_id === caller.id) {
    return jsonResponse({ error: "Use a alteração de senha da própria conta para redefinir sua senha." }, 400);
  }

  const { data: authUserResult, error: authUserError } = await adminClient.auth.admin
    .getUserById(target.auth_user_id);
  const authUser = authUserResult.user;
  if (authUserError || !authUser) {
    return jsonResponse({ error: "A conta vinculada não foi encontrada no Supabase Auth." }, 404);
  }

  const temporaryPassword = gerarSenhaTemporaria();
  const appMetadata = {
    ...(authUser.app_metadata ?? {}),
    require_password_change: true,
  };

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    target.auth_user_id,
    { password: temporaryPassword, app_metadata: appMetadata },
  );
  if (updateError) return jsonResponse({ error: "O Supabase Auth não aceitou a redefinição." }, 500);

  const { error: auditError } = await adminClient.from("auditoria_redefinicao_senha").insert({
    usuario_id: target.id,
    auth_user_id: target.auth_user_id,
    redefinido_por: caller.id,
  });

  // A senha é retornada uma única vez ao Administrador e nunca é registrada em log.
  return jsonResponse({
    temporaryPassword,
    auditRecorded: !auditError,
    userName: target.nome,
  });
});
