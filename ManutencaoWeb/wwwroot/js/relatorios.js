// ============================================================
// RELATÓRIOS - EXPORTAÇÃO EXCEL E PDF
// ============================================================


// ============================================================
// EXPORTAR RANKING PARA EXCEL
// ============================================================

window.exportarRankingExcel = function (dados) {

    if (!dados || dados.length === 0) {
        alert("Não existem dados para exportar.");
        return;
    }

    // Verificar se a biblioteca XLSX está carregada
    if (typeof XLSX === "undefined") {
        alert("A biblioteca Excel (SheetJS) não foi carregada.");
        console.error("XLSX não está disponível.");
        return;
    }

    try {

        // ========================================================
        // PREPARAR DADOS
        // ========================================================

        const linhas = dados.map(item => ({

            "Modelo":
                item.modelo ?? "",

            "Código SAP":
                item.codigoSAP ?? "",

            "Descrição":
                item.descricao ?? "",

            "Quantidade":
                Number(item.quantidade ?? 0),

            "Valor Total":
                Number(item.valorTotal ?? 0)

        }));


        // ========================================================
        // CRIAR PLANILHA
        // ========================================================

        const worksheet =
            XLSX.utils.json_to_sheet(linhas);


        // ========================================================
        // LARGURA DAS COLUNAS
        // ========================================================

        worksheet["!cols"] = [

            { wch: 30 }, // Modelo
            { wch: 18 }, // Código SAP
            { wch: 50 }, // Descrição
            { wch: 15 }, // Quantidade
            { wch: 18 }  // Valor

        ];


        // ========================================================
        // FORMATAR VALOR MONETÁRIO
        // ========================================================

        for (
            let linha = 2;
            linha <= linhas.length + 1;
            linha++
        ) {

            const celula =
                worksheet["E" + linha];

            if (celula) {

                celula.t =
                    "n";

                celula.z =
                    'R$ #,##0.00';

            }

        }


        // ========================================================
        // CRIAR ARQUIVO EXCEL
        // ========================================================

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Ranking"
        );


        // ========================================================
        // DOWNLOAD
        // ========================================================

        XLSX.writeFile(
            workbook,
            "Ranking_Pecas_por_Modelo.xlsx"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao exportar Ranking para Excel:",
            erro
        );

        alert(
            "Ocorreu um erro ao gerar o arquivo Excel."
        );

    }

};


// ============================================================
// EXPORTAR DETALHAMENTO PARA EXCEL
// ============================================================

window.exportarDetalhamentoExcel = function (dados) {

    if (!dados || dados.length === 0) {
        alert("Não existem dados para exportar.");
        return;
    }

    // Verificar se a biblioteca XLSX está carregada
    if (typeof XLSX === "undefined") {
        alert("A biblioteca Excel (SheetJS) não foi carregada.");
        console.error("XLSX não está disponível.");
        return;
    }

    try {

        // ========================================================
        // PREPARAR DADOS
        // ========================================================

        const linhas = dados.map(item => ({

            "O.S.":
                item.os ?? "",

            "Data":
                item.data ?? "",

            "Modelo":
                item.modelo ?? "",

            "Itens":
                Number(item.itens ?? 0),

            "Entregues":
                Number(item.entregues ?? 0),

            "Pendentes":
                Number(item.pendentes ?? 0),

            "Percentual Atendimento":
                Number(item.percentual ?? 0) / 100,

            "Valor":
                Number(item.valor ?? 0)

        }));


        // ========================================================
        // CRIAR PLANILHA
        // ========================================================

        const worksheet =
            XLSX.utils.json_to_sheet(linhas);


        // ========================================================
        // LARGURA DAS COLUNAS
        // ========================================================

        worksheet["!cols"] = [

            { wch: 15 }, // O.S.
            { wch: 20 }, // Data
            { wch: 35 }, // Modelo
            { wch: 12 }, // Itens
            { wch: 14 }, // Entregues
            { wch: 14 }, // Pendentes
            { wch: 25 }, // Percentual
            { wch: 18 }  // Valor

        ];


        // ========================================================
        // FORMATAR PERCENTUAL
        // ========================================================

        for (
            let linha = 2;
            linha <= linhas.length + 1;
            linha++
        ) {

            const celula =
                worksheet["G" + linha];

            if (celula) {

                celula.t =
                    "n";

                celula.z =
                    "0.0%";

            }

        }


        // ========================================================
        // FORMATAR VALOR
        // ========================================================

        for (
            let linha = 2;
            linha <= linhas.length + 1;
            linha++
        ) {

            const celula =
                worksheet["H" + linha];

            if (celula) {

                celula.t =
                    "n";

                celula.z =
                    'R$ #,##0.00';

            }

        }


        // ========================================================
        // CRIAR ARQUIVO EXCEL
        // ========================================================

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Detalhamento"
        );


        // ========================================================
        // DOWNLOAD
        // ========================================================

        XLSX.writeFile(
            workbook,
            "Detalhamento_OS.xlsx"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao exportar Detalhamento para Excel:",
            erro
        );

        alert(
            "Ocorreu um erro ao gerar o arquivo Excel."
        );

    }

};


// ============================================================
// EXPORTAR RELATÓRIO COMPLETO PARA PDF
// ============================================================

window.exportarRelatorioPDF = async function (elementId) {

    const elemento =
        document.getElementById(elementId);


    // ========================================================
    // VERIFICAR ELEMENTO
    // ========================================================

    if (!elemento) {

        alert(
            "Não foi possível localizar a área do relatório."
        );

        return;

    }


    // ========================================================
    // VERIFICAR BIBLIOTECAS
    // ========================================================

    if (typeof html2canvas === "undefined") {

        alert(
            "A biblioteca html2canvas não foi carregada."
        );

        console.error(
            "html2canvas não está disponível."
        );

        return;

    }


    if (
        typeof window.jspdf === "undefined" ||
        typeof window.jspdf.jsPDF === "undefined"
    ) {

        alert(
            "A biblioteca jsPDF não foi carregada."
        );

        console.error(
            "jsPDF não está disponível."
        );

        return;

    }


    // ========================================================
    // MENSAGEM DE PROCESSAMENTO
    // ========================================================

    const mensagem =
        document.createElement("div");


    mensagem.id =
        "mensagemGerandoPdf";


    mensagem.innerHTML = `

        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        ">

            <div style="
                background: white;
                padding: 30px 40px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            ">

                <div class="spinner-border text-success mb-3"></div>

                <div style="
                    font-weight: 600;
                    color: #444;
                ">
                    Gerando relatório PDF...
                </div>

                <small style="
                    display: block;
                    margin-top: 8px;
                    color: #777;
                ">
                    Aguarde alguns segundos.
                </small>

            </div>

        </div>

    `;


    document.body.appendChild(
        mensagem
    );


    let container = null;


    try {

        // ====================================================
        // CLONAR RELATÓRIO
        // ====================================================

        const clone =
            elemento.cloneNode(true);


        // ====================================================
        // REMOVER BOTÕES
        // ====================================================

        const botoes =
            clone.querySelectorAll(
                "button"
            );


        botoes.forEach(
            botao => botao.remove()
        );


        // ====================================================
        // REMOVER ELEMENTOS QUE NÃO DEVEM APARECER
        // ====================================================

        const elementosOcultos =
            clone.querySelectorAll(
                ".no-pdf, .nao-imprimir, .d-print-none"
            );


        elementosOcultos.forEach(
            item => item.remove()
        );


        // ====================================================
        // CONFIGURAÇÃO DO CLONE
        // ====================================================

        clone.style.width =
            "1400px";

        clone.style.maxWidth =
            "1400px";

        clone.style.background =
            "#f4f6f5";

        clone.style.padding =
            "20px";

        clone.style.margin =
            "0";

        clone.style.boxSizing =
            "border-box";


        // ====================================================
        // CONTAINER TEMPORÁRIO
        // ====================================================

        container =
            document.createElement("div");


        container.style.position =
            "absolute";

        container.style.left =
            "-100000px";

        container.style.top =
            "0";

        container.style.width =
            "1400px";

        container.style.background =
            "#f4f6f5";


        container.appendChild(
            clone
        );


        document.body.appendChild(
            container
        );


        // ====================================================
        // AGUARDAR RENDERIZAÇÃO
        // ====================================================

        await new Promise(
            resolve =>
                setTimeout(resolve, 300)
        );


        // ====================================================
        // GERAR CANVAS
        // ====================================================

        const canvas =
            await html2canvas(
                clone,
                {

                    scale: 1.5,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#f4f6f5",

                    logging: false,

                    windowWidth: 1400

                }
            );


        // ====================================================
        // CRIAR PDF
        // ====================================================

        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF({

                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4",

                compress:
                    true

            });


        // ====================================================
        // CONFIGURAÇÕES DA PÁGINA
        // ====================================================

        const margem =
            8;


        const larguraPagina =
            pdf.internal.pageSize.getWidth();


        const alturaPagina =
            pdf.internal.pageSize.getHeight();


        const larguraUtil =
            larguraPagina -
            margem * 2;


        const alturaUtil =
            alturaPagina -
            margem * 2;


        // ====================================================
        // PROPORÇÃO DA IMAGEM
        // ====================================================

        const proporcao =
            larguraUtil /
            canvas.width;


        const alturaImagem =
            canvas.height *
            proporcao;


        // ====================================================
        // DIVISÃO EM PÁGINAS
        // ====================================================

        let alturaRestante =
            alturaImagem;


        let posicaoCanvas =
            0;


        let paginaAtual =
            0;


        while (
            alturaRestante > 0
        ) {

            // Adicionar nova página
            if (
                paginaAtual > 0
            ) {

                pdf.addPage();

            }


            // Altura disponível
            const alturaCorte =
                Math.min(
                    alturaUtil,
                    alturaRestante
                );


            // Converter altura do PDF
            // para altura original do canvas
            const alturaCanvas =
                Math.ceil(
                    alturaCorte /
                    proporcao
                );


            // ==================================================
            // CRIAR CANVAS DA PÁGINA
            // ==================================================

            const canvasPagina =
                document.createElement(
                    "canvas"
                );


            canvasPagina.width =
                canvas.width;


            canvasPagina.height =
                alturaCanvas;


            const contexto =
                canvasPagina.getContext(
                    "2d"
                );


            // ==================================================
            // RECORTAR PARTE CORRETA
            // ==================================================

            contexto.drawImage(

                canvas,

                0,

                Math.floor(
                    posicaoCanvas
                ),

                canvas.width,

                alturaCanvas,

                0,

                0,

                canvas.width,

                alturaCanvas

            );


            // ==================================================
            // TRANSFORMAR EM IMAGEM
            // ==================================================

            const imagem =
                canvasPagina.toDataURL(
                    "image/jpeg",
                    0.92
                );


            // ==================================================
            // ADICIONAR AO PDF
            // ====================================================

            pdf.addImage(

                imagem,

                "JPEG",

                margem,

                margem,

                larguraUtil,

                alturaCorte

            );


            // ==================================================
            // ATUALIZAR POSIÇÃO
            // ==================================================

            posicaoCanvas +=
                alturaCanvas;


            alturaRestante -=
                alturaCorte;


            paginaAtual++;

        }


        // ========================================================
        // RODAPÉ DAS PÁGINAS
        // ========================================================

        const quantidadePaginas =
            pdf.internal.getNumberOfPages();


        for (
            let pagina = 1;
            pagina <= quantidadePaginas;
            pagina++
        ) {

            pdf.setPage(
                pagina
            );


            pdf.setFontSize(
                8
            );


            pdf.setTextColor(
                120,
                120,
                120
            );


            pdf.text(

                `Relatório ManutencaoWeb - Página ${pagina} de ${quantidadePaginas}`,

                larguraPagina / 2,

                alturaPagina - 3,

                {
                    align: "center"
                }

            );

        }


        // ========================================================
        // NOME DO ARQUIVO
        // ========================================================

        const data =
            new Date();


        const dataFormatada =
            data
                .toLocaleDateString(
                    "pt-BR"
                )
                .replaceAll(
                    "/",
                    "-"
                );


        // ========================================================
        // DOWNLOAD
        // ========================================================

        pdf.save(

            `Relatorio_ManutencaoWeb_${dataFormatada}.pdf`

        );

    }
    catch (erro) {

        console.error(
            "Erro ao gerar PDF:",
            erro
        );


        alert(
            "Ocorreu um erro ao gerar o relatório PDF."
        );

    }
    finally {

        // ========================================================
        // REMOVER CLONE
        // ========================================================

        if (container) {

            container.remove();

        }


        // ========================================================
        // REMOVER MENSAGEM
        // ========================================================

        const mensagemAtual =
            document.getElementById(
                "mensagemGerandoPdf"
            );


        if (mensagemAtual) {

            mensagemAtual.remove();

        }

    }

};

