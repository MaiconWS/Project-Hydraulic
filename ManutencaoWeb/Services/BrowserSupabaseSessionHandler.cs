using System.Text.Json;
using Microsoft.JSInterop;
using Supabase.Gotrue;
using Supabase.Gotrue.Interfaces;

namespace ManutencaoWeb.Services;

/// <summary>
/// Persiste a sessão do Supabase no armazenamento local do navegador para
/// que ela possa ser restaurada após recarregar ou reabrir o app.
/// </summary>
public sealed class BrowserSupabaseSessionHandler
    : IGotrueSessionPersistence<Session>
{
    private const string StorageKey = "manutencao-web.supabase-session";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IJSInProcessRuntime _js;

    public BrowserSupabaseSessionHandler(IJSInProcessRuntime js)
    {
        _js = js;
    }

    public void SaveSession(Session session)
    {
        try
        {
            var json = JsonSerializer.Serialize(session, JsonOptions);
            _js.InvokeVoid("manutencaoAuthStorage.set", StorageKey, json);
        }
        catch
        {
            // Bloqueios do armazenamento do navegador não devem impedir o login.
        }
    }

    public void DestroySession()
    {
        try
        {
            _js.InvokeVoid("manutencaoAuthStorage.remove", StorageKey);
        }
        catch
        {
            // A sessão em memória ainda será encerrada pelo Supabase Auth.
        }
    }

    public Session LoadSession()
    {
        try
        {
            var json = _js.Invoke<string?>("manutencaoAuthStorage.get", StorageKey);
            return string.IsNullOrWhiteSpace(json)
                ? null!
                : JsonSerializer.Deserialize<Session>(json, JsonOptions)!;
        }
        catch
        {
            return null!;
        }
    }
}
