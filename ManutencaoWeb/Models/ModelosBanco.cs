using Postgrest.Attributes;
using Postgrest.Models;
using System.Text.Json.Serialization;

namespace ManutencaoWeb.Models
{
    // Mapeamento da tabela "componentes"
    [Table("componentes")]
    public class ComponenteModel : BaseModel
    {
        [Column("sap_comp")] public string ?SapComp { get; set; }
        [Column("modelo")] public string ?Modelo { get; set; }
        [Column("imagem_url")] public string ?ImagemUrl { get; set; }
        
        // Relacionamento com a tabela sistemas (para o filtro de categoria)
        [Reference(typeof(SistemaModel), ReferenceAttribute.JoinType.Inner)]
        public SistemaModel ?Sistema { get; set; }
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
        [Column("sap_peca")] public string ?SapPeca { get; set; }
        [Column("descricao")] public string ?Descricao { get; set; }
        [Column("valor")] public double Valor { get; set; }
        [Column("sap_comp")] public string ?SapComp { get; set; }
    }

    // Mapeamento da tabela "solicitacoes"
// Mapeamento da tabela "solicitacoes"
    [Table("solicitacoes")]
    public class SolicitacaoModel : BaseModel
    {
        [Column("os_numero")] public string? OsNumero { get; set; }
        [Column("modelo_solicitado")] public string? ModeloSolicitado { get; set; }
        
        // Alterado para object para aceitar a lista serializada sem conflitos do driver
        [Column("itens_json")] public object? ItensJson { get; set; } 
        
        [Column("data_envio")] public DateTime DataEnvio { get; set; }
    }

    // Estrutura do JSON que vai dentro da solicitação
public class ItemJson
    {
        [JsonPropertyName("sap")] 
        public string? Sap { get; set; }

        [JsonPropertyName("descricao")] 
        public string? Descricao { get; set; }

        [JsonPropertyName("quantidade")] 
        public int Quantidade { get; set; }

        [JsonPropertyName("valor")] 
        public double Valor { get; set; }
    }
}