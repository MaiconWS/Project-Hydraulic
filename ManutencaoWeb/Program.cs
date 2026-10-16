using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.AspNetCore.Components.Authorization;

using ManutencaoWeb;
using ManutencaoWeb.Services;

using Supabase;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

var url = "https://zzkuzsfxzfeyvinasgic.supabase.co";

var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3V6c2Z4emZleXZpbmFzZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNDM0OTcsImV4cCI6MjEwMTcxOTQ5N30.j4NoeYx69jR7P_S1wE1-oF9hGNnR6uWJ0cnSdus5UeE";

var options = new SupabaseOptions
{
    AutoConnectRealtime = true
};

// ============================================================
// SERVIÇOS
// ============================================================

// Supabase
builder.Services.AddScoped(sp =>
{
    var jsRuntime = sp.GetRequiredService<Microsoft.JSInterop.IJSRuntime>()
        as Microsoft.JSInterop.IJSInProcessRuntime
        ?? throw new InvalidOperationException(
            "O armazenamento persistente da sessão requer o runtime WebAssembly.");

    options.AutoRefreshToken = true;
    options.SessionHandler = new BrowserSupabaseSessionHandler(jsRuntime);

    return new Supabase.Client(url, key, options);
});

// HttpClient
builder.Services.AddScoped(sp =>
    new HttpClient
    {
        BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
    });

// ============================================================
// AUTENTICAÇÃO
// ============================================================

builder.Services.AddAuthorizationCore();

builder.Services.AddScoped<
    SupabaseAuthenticationStateProvider>();

builder.Services.AddScoped<
    AuthenticationStateProvider>(
    sp => sp.GetRequiredService<
        SupabaseAuthenticationStateProvider>());

// ============================================================
// SESSÃO LEGADA
//
// Mantida temporariamente durante a migração.
// NÃO remover ainda.
// ============================================================

builder.Services.AddSingleton<SessaoService>();

// ============================================================
// INICIAR A APLICAÇÃO
// ============================================================

await builder.Build().RunAsync();
