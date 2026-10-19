const criarLaudoSucateamentoPdf = function (dados) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("A biblioteca de PDF não está disponível.");
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const margem = 15;
    const larguraUtil = 180;
    const limiteY = 282;
    let y = 18;

    const texto = (valor) => String(valor ?? "-").replace(/[\u0000-\u001F\u007F]/g, " ").trim() || "-";
    const novaPaginaSePreciso = (altura) => {
        if (y + altura > limiteY) {
            pdf.addPage();
            y = 18;
        }
    };
    const adicionarTexto = (valor, x = margem, largura = larguraUtil, alturaLinha = 5) => {
        const linhas = pdf.splitTextToSize(texto(valor), largura);
        novaPaginaSePreciso(linhas.length * alturaLinha + 2);
        pdf.text(linhas, x, y);
        y += linhas.length * alturaLinha + 2;
    };
    const secao = (titulo) => {
        novaPaginaSePreciso(13);
        y += 3;
        pdf.setFillColor(46, 102, 75);
        pdf.roundedRect(margem, y - 4, larguraUtil, 9, 1.5, 1.5, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(texto(titulo), margem + 3, y + 2);
        pdf.setTextColor(30, 40, 35);
        y += 10;
    };
    const campo = (rotulo, valor) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        adicionarTexto(rotulo);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        adicionarTexto(valor);
    };
    const moeda = (valor) => new Intl.NumberFormat("pt-BR", {
        style: "currency", currency: "BRL"
    }).format(Number(valor ?? 0));

    pdf.setTextColor(46, 102, 75);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    adicionarTexto(`LAUDO DE SUCATEAMENTO - SAP ${texto(dados.sapComponente)} - (${texto(dados.descricaoComponente)})`, margem, larguraUtil, 7);

    pdf.setTextColor(35, 45, 40);
    pdf.setFontSize(12);
    adicionarTexto(`O.S. ${texto(dados.osNumero)} - Frota ${texto(dados.frota)}`, margem, larguraUtil, 6);

    pdf.setDrawColor(46, 102, 75);
    pdf.line(margem, y, margem + larguraUtil, y);
    y += 7;

    secao("Identificação");
    campo("O.S.", dados.osNumero);
    campo("Componente / modelo", dados.descricaoComponente);
    campo("SAP do componente", dados.sapComponente);
    campo("Frota", dados.frota);
    campo("Tag / número de série", dados.tagSerie);
    campo("Data de recebimento", dados.dataRecebimento);
    campo("Data de emissão", dados.dataLaudo);

    secao("Parecer técnico");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    adicionarTexto(dados.parecerTecnico);

    secao("Itens da reforma e evidências");
    (dados.pecas || []).forEach((peca, indice) => {
        novaPaginaSePreciso(22);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        adicionarTexto(`Item ${indice + 1}: SAP ${texto(peca.sap)} - ${texto(peca.descricao)}`);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        adicionarTexto(`Quantidade: ${Number(peca.quantidade ?? 1)} | Valor unitário: ${moeda(peca.valorUnitario)} | Subtotal: ${moeda(peca.subtotal)}`);
        adicionarTexto(`Motivo da troca: ${texto(peca.motivo)}`);

        (peca.fotos || []).forEach((foto) => {
            try {
                const propriedades = pdf.getImageProperties(foto.dataUrl);
                let largura = 85;
                let altura = largura / (propriedades.width / propriedades.height);
                if (altura > 58) {
                    altura = 58;
                    largura = altura * (propriedades.width / propriedades.height);
                }
                novaPaginaSePreciso(altura + 12);
                pdf.setFontSize(8);
                adicionarTexto(`Foto: ${foto.nome}`);
                pdf.addImage(foto.dataUrl, foto.mimeType === "image/png" ? "PNG" : "JPEG", margem, y, largura, altura);
                y += altura + 5;
            } catch {
                novaPaginaSePreciso(8);
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(8);
                adicionarTexto(`Não foi possível inserir a foto ${foto.nome}.`);
            }
        });
        y += 2;
    });

    secao("Comparativo de valores");
    campo("Total estimado dos itens da reforma", moeda(dados.totalReforma));
    campo("Valor do componente novo", moeda(dados.valorComponenteNovo));

    secao("Validação antes do envio");
    campo("Responsável pela validação", dados.responsavelValidacao);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    adicionarTexto("Validado em: ____/____/________");
    adicionarTexto("Observações da validação: __________________________________________________");

    const limparNome = (valor) => texto(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "componente";
    return {
        pdf,
        nomeArquivo: `laudo-sucateamento-${limparNome(dados.sapComponente)}-${limparNome(dados.osNumero)}.pdf`
    };
};

window.gerarLaudoSucateamentoPdf = function (dados) {
    const { pdf, nomeArquivo } = criarLaudoSucateamentoPdf(dados);
    pdf.save(nomeArquivo);
};

window.compartilharLaudoSucateamentoPdf = async function (dados) {
    const { pdf, nomeArquivo } = criarLaudoSucateamentoPdf(dados);
    const arquivo = new File([pdf.output("blob")], nomeArquivo, { type: "application/pdf" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        await navigator.share({
            files: [arquivo],
            title: "Laudo de sucateamento",
            text: `Laudo de sucateamento da O.S. ${dados.osNumero}`
        });
        return "compartilhado";
    }

    pdf.save(nomeArquivo);
    const mensagem = `Segue o laudo de sucateamento da O.S. ${dados.osNumero}. O PDF foi baixado; anexe o arquivo nesta conversa.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
    return "baixado";
};
