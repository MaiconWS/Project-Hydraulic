using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using ManutencaoWeb.Models;

namespace ManutencaoWeb.Services
{
    public class SupabaseAuthenticationStateProvider
        : AuthenticationStateProvider
    {
        private readonly Supabase.Client _supabase;
        private readonly SessaoService _sessao;

        private ClaimsPrincipal _currentUser =
            new ClaimsPrincipal(new ClaimsIdentity());

        public SupabaseAuthenticationStateProvider(
            Supabase.Client supabase,
            SessaoService sessao)
        {
            _supabase = supabase;
            _sessao = sessao;

            _supabase.Auth.AddStateChangedListener(OnAuthStateChanged);
        }

        // ============================================================
        // ESTADO ATUAL DA AUTENTICAÇÃO
        // ============================================================

        public override Task<AuthenticationState>
            GetAuthenticationStateAsync()
        {
            return Task.FromResult(
                new AuthenticationState(_currentUser)
            );
        }

        // ============================================================
        // EVENTO DE ALTERAÇÃO DO SUPABASE AUTH
        // ============================================================

        private async void OnAuthStateChanged(
            Supabase.Gotrue.Interfaces.IGotrueClient<
                Supabase.Gotrue.User,
                Supabase.Gotrue.Session> sender,
            Supabase.Gotrue.Constants.AuthState state)
        {
            try
            {
                if (state == Supabase.Gotrue.Constants.AuthState.SignedIn)
                {
                    await AtualizarUsuarioAutenticado();
                }
                else if (state == Supabase.Gotrue.Constants.AuthState.SignedOut)
                {
                    LimparAutenticacao();
                }
            }
            catch
            {
                LimparAutenticacao();
            }
        }

        // ============================================================
        // CARREGAR USUÁRIO AUTENTICADO
        // ============================================================

        public async Task<bool> CarregarUsuarioAutenticadoAsync()
        {
            try
            {
                var authUser = _supabase.Auth.CurrentUser;

                if (authUser == null)
                {
                    LimparAutenticacao();
                    return false;
                }

                return await AtualizarUsuarioAutenticado();
            }
            catch
            {
                LimparAutenticacao();
                return false;
            }
        }

        // ============================================================
        // ATUALIZAR CLAIMS + SESSAO
        // ============================================================

        private async Task<bool> AtualizarUsuarioAutenticado()
        {
            var authUser = _supabase.Auth.CurrentUser;

            if (authUser == null)
            {
                LimparAutenticacao();
                return false;
            }

            string authUserId =
                authUser.Id?.ToString() ?? string.Empty;

            string email =
                authUser.Email ?? string.Empty;

            if (string.IsNullOrWhiteSpace(authUserId))
            {
                LimparAutenticacao();
                return false;
            }

            string nome = email;
            string perfil = "Mecanico";
            bool exigeTrocaSenha = false;

            try
            {
                var response = await _supabase
                    .From<UsuarioModel>()
                    .Filter(
                        "auth_user_id",
                        Postgrest.Constants.Operator.Equals,
                        authUserId
                    )
                    .Get();

                var usuario = response.Models.FirstOrDefault();

                if (usuario == null)
                {
                    LimparAutenticacao();
                    return false;
                }

                nome = usuario.Nome ?? email;
                perfil = usuario.Perfil ?? "Mecanico";

                if (authUser.AppMetadata != null &&
                    authUser.AppMetadata.TryGetValue("require_password_change", out var flag))
                {
                    bool.TryParse(Convert.ToString(flag), out exigeTrocaSenha);
                }

                // ====================================================
                // MANTÉM O SISTEMA ANTIGO SINCRONIZADO
                // ====================================================

                _sessao.Login(
                    nome,
                    email,
                    perfil,
                    exigeTrocaSenha
                );
            }
            catch
            {
                LimparAutenticacao();
                return false;
            }

            // ========================================================
            // CRIA CLAIMS
            // ========================================================

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    authUserId
                ),

                new Claim(
                    ClaimTypes.Name,
                    nome ?? string.Empty
                ),

                new Claim(
                    ClaimTypes.Email,
                    email ?? string.Empty
                ),

                new Claim(
                    ClaimTypes.Role,
                    perfil ?? "Mecanico"
                ),

                new Claim(
                    "require_password_change",
                    exigeTrocaSenha.ToString().ToLowerInvariant()
                )
            };

            var identity = new ClaimsIdentity(
                claims,
                "Supabase"
            );

            _currentUser =
                new ClaimsPrincipal(identity);

            // ========================================================
            // AVISA O BLAZOR QUE A AUTENTICAÇÃO MUDOU
            // ========================================================

            NotifyAuthenticationStateChanged(
                Task.FromResult(
                    new AuthenticationState(_currentUser)
                )
            );

            return true;
        }

        // ============================================================
        // LIMPAR AUTENTICAÇÃO
        // ============================================================

        private void LimparAutenticacao()
        {
            _sessao.Logout();

            _currentUser =
                new ClaimsPrincipal(
                    new ClaimsIdentity()
                );

            NotifyAuthenticationStateChanged(
                Task.FromResult(
                    new AuthenticationState(_currentUser)
                )
            );
        }

        // ============================================================
        // RECARREGAR ESTADO
        // ============================================================

        public async Task RecarregarEstadoAsync()
        {
            await CarregarUsuarioAutenticadoAsync();
        }
    }
}
