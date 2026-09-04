using Postgrest.Attributes;
using Postgrest.Models;
using System.Text.Json.Serialization;

namespace ManutencaoWeb.Models
{
    // Mapeamento da tabela "componentes"
    [Table("componentes")]
    public class ComponenteModel : BaseModel
    {
        [Column("sap_comp")] public string? SapComp { get; set; }
        [Column("modelo")] public string? Modelo { get; set; }
        [Column("imagem_url")] public string? ImagemUrl { get; set; }
        
        [Reference(typeof(SistemaModel), ReferenceAttribute.JoinType.Inner)]
        public SistemaModel? Sistema { get; set; }
    }

    [Table("sistemas")]
    public class SistemaModel : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("categoria")] 
        public string? Categoria { get; set; }
    }

    // Mapeamento da tabela "pecas"
    [Table("pecas")]
    public class PecaModel : BaseModel
    {
        [Column("sap_peca")] public string? SapPeca { get; set; }
        [Column("descricao")] public string? Descricao { get; set; }
        [Column("valor")] public double Valor { get; set; }
        [Column("sap_comp")] public string? SapComp { get; set; }
    }

    // Mapeamento oficial e único da tabela "solicitacoes"
    [Table("solicitacoes")]
    public class SolicitacaoCompletaModel : BaseModel
    {
        [PrimaryKey("id")] public int Id { get; set; }
        [Column("os_numero")] public string? OsNumero { get; set; }
        [Column("modelo_solicitado")] public string? ModeloSolicitado { get; set; }
        [Column("itens_json")] public List<ItemRequisicaoModel>? ItensJson { get; set; }
        [Column("data_envio")] public DateTime DataEnvio { get; set; }
        [Column("status")] public string? Status { get; set; } = "Pendente";
    }

    // Estrutura dos itens salvos dentro do JSON
    public class ItemRequisicaoModel
    {
        [JsonPropertyName("sap")] public string? Sap { get; set; }
        [JsonPropertyName("descricao")] public string? Descricao { get; set; }
        [JsonPropertyName("quantidade")] public int Quantidade { get; set; }
        [JsonPropertyName("valor")] public double Valor { get; set; }
        [JsonPropertyName("entregue")] public bool Entregue { get; set; }
    }
}