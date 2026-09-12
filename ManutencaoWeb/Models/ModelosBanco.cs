using Postgrest.Attributes;
using Postgrest.Models;
using System.Text.Json.Serialization;

namespace ManutencaoWeb.Models
{
    // ============================================================
    // COMPONENTES
    // ============================================================

    [Table("componentes")]
    public class ComponenteModel : BaseModel
    {
        [Column("sap_comp")]
        public string? SapComp { get; set; }

        [Column("modelo")]
        public string? Modelo { get; set; }

        [Column("imagem_url")]
        public string? ImagemUrl { get; set; }

        [Column("sistema_id")]
        public int SistemaId { get; set; }

        [Reference(typeof(SistemaModel), ReferenceAttribute.JoinType.Inner)]
        public SistemaModel? Sistema { get; set; }
    }


    // ============================================================
    // SISTEMAS
    // ============================================================

    [Table("sistemas")]
    public class SistemaModel : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("categoria")]
        public string? Categoria { get; set; }
    }


    // ============================================================
    // PEÇAS
    // ============================================================

    [Table("pecas")]
    public class PecaModel : BaseModel
    {
        [Column("sap_peca")]
        public string? SapPeca { get; set; }

        [Column("descricao")]
        public string? Descricao { get; set; }

        [Column("valor")]
        public double Valor { get; set; }

        [Column("sap_comp")]
        public string? SapComp { get; set; }
    }


    // ============================================================
    // SOLICITAÇÕES
    // ============================================================

    [Table("solicitacoes")]
    public class SolicitacaoCompletaModel : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("os_numero")]
        public string? OsNumero { get; set; }

        [Column("modelo_solicitado")]
        public string? ModeloSolicitado { get; set; }

        // Mantido para compatibilidade com o sistema atual.
        // O controle de entrega agora é feito em solicitacao_itens.
        [Column("itens_json")]
        public List<ItemRequisicaoModel>? ItensJson { get; set; }

        [Column("data_envio")]
        public DateTime DataEnvio { get; set; }

        [Column("status")]
        public string? Status { get; set; } = "Pendente";

        [Column("solicitante_nome")]
        public string? SolicitanteNome { get; set; }
    }


    // ============================================================
    // ITENS ANTIGOS DO JSON
    // ============================================================
    // Mantido porque outras páginas do sistema podem utilizar
    // esse modelo enquanto a migração para solicitacao_itens
    // não for concluída em todo o projeto.
    // ============================================================

    public class ItemRequisicaoModel
    {
        [JsonPropertyName("sap")]
        public string? Sap { get; set; }

        [JsonPropertyName("descricao")]
        public string? Descricao { get; set; }

        [JsonPropertyName("quantidade")]
        public int Quantidade { get; set; }

        [JsonPropertyName("valor")]
        public double Valor { get; set; }

        [JsonPropertyName("entregue")]
        public bool Entregue { get; set; }
    }


    // ============================================================
    // NOVO MODEL: SOLICITACAO_ITENS
    // ============================================================
    // Cada peça de uma solicitação possui agora sua própria linha
    // no banco de dados.
    //
    // Isso permite atualizar somente uma peça quando ela for
    // entregue, evitando regravar o itens_json inteiro.
    // ============================================================

    [Table("solicitacao_itens")]
    public class SolicitacaoItemModel : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("solicitacao_id")]
        public int SolicitacaoId { get; set; }

        [Column("sap_peca")]
        public string? SapPeca { get; set; }

        [Column("descricao")]
        public string? Descricao { get; set; }

        [Column("quantidade")]
        public int Quantidade { get; set; }

        [Column("valor")]
        public double Valor { get; set; }

        [Column("entregue")]
        public bool Entregue { get; set; }
    }


    // ============================================================
    // USUÁRIOS
    // ============================================================

    [Table("usuarios")]
    public class UsuarioModel : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string? Nome { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("senha")]
        public string? Senha { get; set; }

        [Column("perfil")]
        public string? Perfil { get; set; }
    }
}