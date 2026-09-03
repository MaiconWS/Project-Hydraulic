using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using ManutencaoWeb;
using Supabase;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// Configuração do Supabase
var url = "https://zzkuzsfxzfeyvinasgic.supabase.co";
var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3V6c2Z4emZleXZpbmFzZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNDM0OTcsImV4cCI6MjEwMTcxOTQ5N30.j4NoeYx69jR7P_S1wE1-oF9hGNnR6uWJ0cnSdus5UeE";
var options = new SupabaseOptions { AutoConnectRealtime = true };

builder.Services.AddScoped<Supabase.Client>(_ => new Supabase.Client(url, key, options));
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();