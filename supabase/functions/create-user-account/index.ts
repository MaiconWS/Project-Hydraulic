import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Método não permitido." }, 405);

  const token = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonResponse({ error: "Sessão inválida." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey)
    return jsonResponse({ error: "Configuração segura do Supabase indisponível." }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  const caller = callerData.user;
  if (callerError || !caller) return jsonResponse({ error: "Sessão inválida." }, 401);

  const { data: callerProfile, error: profileError } = await admin
    .from("usuarios")
    .select("perfil")
    .eq("auth_user_id", caller.id)
    .maybeSingle();
  if (profileError || callerProfile?.perfil !== "Admin")
    return jsonResponse({ error: "Apenas Administradores podem cadastrar usuários." }, 403);

  let body: { nome?: unknown; email?: unknown; password?: unknown; perfil?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Dados da solicitação inválidos." }, 400);
  }

  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const perfil = typeof body.perfil === "string" ? body.perfil : "";
  if (!nome || !email || !password || !["Mecanico", "Aprovisionador", "Admin"].includes(perfil))
    return jsonResponse({ error: "Informe nome, e-mail de login, senha provisória e perfil válido." }, 400);
  if (password.length < 12)
    return jsonResponse({ error: "A senha provisória deve ter pelo menos 12 caracteres." }, 400);

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("usuarios")
    .select("id, auth_user_id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfileError)
    return jsonResponse({ error: "Não foi possível validar o cadastro existente. Verifique se o e-mail é único." }, 409);
  if (existingProfile?.auth_user_id)
    return jsonResponse({ error: "Este cadastro já está vinculado a uma conta Auth." }, 409);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
    app_metadata: { require_password_change: true },
  });
  if (createError || !created.user)
    return jsonResponse({ error: createError?.message ?? "Não foi possível criar a conta no Auth." }, 400);

  const profileData = { auth_user_id: created.user.id, nome, email, perfil };
  const { error: profileWriteError } = existingProfile
    ? await admin.from("usuarios").update(profileData).eq("id", existingProfile.id)
    : await admin.from("usuarios").insert(profileData);

  if (profileWriteError) {
    // Compensa a criação no Auth para evitar uma conta sem perfil no sistema.
    await admin.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: "A conta Auth foi criada, mas o perfil não pôde ser salvo. A criação foi revertida." }, 500);
  }

  return jsonResponse({ userId: created.user.id, nome, email, perfil }, 201);
});
