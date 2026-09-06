namespace ManutencaoWeb.Services
{
    public class SessaoService
    {
        public bool EstaLogado { get; private set; } = false;
        public bool IsAdmin { get; private set; } = false;
        
        private string _nomeCompleto = string.Empty;
        
        // Retorna apenas o primeiro nome
        public string NomeUsuario 
        { 
            get 
            {
                if (string.IsNullOrWhiteSpace(_nomeCompleto)) return string.Empty;
                return _nomeCompleto.Split(' ')[0];
            }
        }

        public string EmailUsuario { get; private set; } = string.Empty;
        public string Iniciais => string.IsNullOrEmpty(_nomeCompleto) ? "" : _nomeCompleto.Substring(0, 1).ToUpper();

        public void Login(string nome, string email, string perfil)
        {
            EstaLogado = true;
            IsAdmin = string.Equals(perfil, "Admin", StringComparison.OrdinalIgnoreCase);
            _nomeCompleto = nome;
            EmailUsuario = email;
        }

        public void Logout()
        {
            EstaLogado = false;
            IsAdmin = false;
            _nomeCompleto = string.Empty;
            EmailUsuario = string.Empty;
        }
    }
}