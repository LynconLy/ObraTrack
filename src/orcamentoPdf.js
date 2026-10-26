import { jsPDF } from "jspdf";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { EMPRESA } from "./empresa";
import { formatarMoeda } from "./utils";

// Cores (RGB) e medidas da página A4, em milímetros
const AZUL = [0, 26, 143], AMARELO = [245, 183, 0], TEXTO = [31, 42, 51];
const CINZA = [95, 107, 115], FAIXA = [237, 235, 231], LINHA = [228, 225, 218];
const M = 13, L = 210, A = 297, D = L - M; // margem, largura, altura e borda direita
const LOGO = [[0,0],[323,0],[323,185],[217,88],[137,161],[137,111],[74,111],[74,222],[0,289]];

// O PDF só aceita caracteres comuns: tira emojis e quebras de linha do texto
const limpar = (t) => String(t ?? "").replace(/\s+/g, " ")
  .replace(/[^\u0020-\u00FF\u2013\u2014\u2018-\u201D\u2022\u2026]/g, "").trim();
const dinheiro = (v) => limpar(formatarMoeda(v));

// Uma obra também pode virar orçamento: as tarefas viram os itens
export function obraComoOrcamento(obra) {
  return { numero: obra.numeroOrcamento, nome: obra.nome, cliente: obra.cliente,
    endereco: obra.endereco, descricao: obra.descricao, itens: obra.tarefas };
}

function desenharLogo(doc, x, y, k) {
  const v = LOGO.slice(1).map((p, i) => [(p[0] - LOGO[i][0]) * k, (p[1] - LOGO[i][1]) * k]);
  doc.setFillColor(255, 255, 255);
  doc.lines(v, x, y, [1, 1], "F", true);
}

function campo(doc, rotulo, valor, x, y) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...CINZA);
  doc.text(rotulo.toUpperCase(), x, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TEXTO);
  doc.text(doc.splitTextToSize(limpar(valor) || "-", 88).slice(0, 2), x, y + 6);
}

function cabecalhoTabela(doc, y) {
  doc.setFillColor(...FAIXA); doc.rect(M, y, D - M, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...CINZA);
  doc.text("Nº", M + 2, y + 4.7); doc.text("SERVIÇO", M + 13, y + 4.7);
  doc.text("VALOR", 165, y + 4.7, { align: "right" });
  doc.text("% TOTAL", D - 2, y + 4.7, { align: "right" });
  return y + 7;
}

export async function gerarOrcamentoPdf(orc) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const total = orc.itens.reduce((soma, i) => soma + i.valor, 0);

  // Faixa azul do topo: logo, empresa e número do orçamento
  doc.setFillColor(...AZUL); doc.rect(0, 0, L, 42, "F");
  desenharLogo(doc, M + 2, 14, 0.0458);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13.5); doc.text(limpar(EMPRESA.nome), M + 24, 20);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(limpar(EMPRESA.contato), M + 24, 26);
  doc.setFontSize(8); doc.text("ORÇAMENTO", D, 13, { align: "right" });
  if (orc.numero) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text("Nº " + String(orc.numero).padStart(4, "0"), D, 22, { align: "right" });
  }
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("pt-BR"), D, 29, { align: "right" });

  // Dados do orçamento
  campo(doc, "Cliente", orc.cliente, M, 54);
  campo(doc, "Obra", orc.nome, M + 97, 54);
  campo(doc, "Endereço", orc.endereco, M, 69);
  campo(doc, "Validade da proposta", `${EMPRESA.validadeDias} dias`, M + 97, 69);

  // Tabela de serviços (se passar do fim da página, continua na próxima)
  let y = cabecalhoTabela(doc, 84);
  orc.itens.forEach((it, n) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.75);
    const titulo = doc.splitTextToSize(limpar(it.titulo), 102);
    doc.setFontSize(8);
    const obs = it.observacao ? doc.splitTextToSize(limpar(it.observacao), 102) : [];
    const h = Math.max(9.5, 4.2 * titulo.length + 5 + 3.6 * obs.length);
    if (y + h > A - 22) { doc.addPage(); y = cabecalhoTabela(doc, 16); }

    doc.setFontSize(9.75); doc.setTextColor(...CINZA);
    doc.text(String(n + 1).padStart(2, "0"), M + 2, y + 6);
    doc.setTextColor(...TEXTO); doc.text(titulo, M + 13, y + 6);
    if (obs.length) {
      doc.setFontSize(8); doc.setTextColor(...CINZA);
      doc.text(obs, M + 13, y + 6 + 4.2 * titulo.length);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.75); doc.setTextColor(...TEXTO);
    doc.text(dinheiro(it.valor), 165, y + 6, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setTextColor(...CINZA);
    const pct = total ? ((it.valor / total) * 100).toFixed(1).replace(".", ",") : "0,0";
    doc.text(pct + "%", D - 2, y + 6, { align: "right" });
    doc.setDrawColor(...LINHA); doc.setLineWidth(0.2); doc.line(M, y + h, D, y + h);
    y += h;
  });

  // Caixa do valor total
  if (y + 30 > A - 22) { doc.addPage(); y = 16; }
  y += 6;
  doc.setFillColor(...AZUL); doc.roundedRect(D - 100, y, 100, 19, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...AMARELO);
  doc.text("VALOR TOTAL", D - 93, y + 11.3);
  doc.setFontSize(18); doc.setTextColor(255, 255, 255);
  doc.text(dinheiro(total), D - 6, y + 12.5, { align: "right" });
  y += 28;

  // Condições e observações
  const linhas = [`Pagamento: ${EMPRESA.pagamento}`];
  if (orc.descricao) linhas.push(`Observações: ${orc.descricao}`);
  const texto = linhas.flatMap((t) => doc.splitTextToSize(limpar(t), D - M));
  if (y + 12 + texto.length * 5 > A - 40) { doc.addPage(); y = 16; }
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...CINZA);
  doc.text("CONDIÇÕES", M, y);
  doc.setFontSize(10); doc.setTextColor(...TEXTO);
  doc.text(texto, M, y + 6, { lineHeightFactor: 1.4 });
  y += 6 + texto.length * 5;

  // Assinaturas (na última página)
  if (y > A - 40) doc.addPage();
  doc.setDrawColor(...TEXTO); doc.setLineWidth(0.3);
  doc.line(M, A - 30, M + 85, A - 30); doc.line(M + 97, A - 30, D, A - 30);
  doc.setFontSize(9);
  doc.text(`Contratante · ${limpar(orc.cliente)}`, M, A - 25.5);
  doc.text(`Contratada · ${limpar(EMPRESA.nome)}`, M + 97, A - 25.5);

  // Rodapé em todas as páginas
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setFillColor(...FAIXA); doc.rect(0, A - 11, L, 11, "F");
    doc.setFontSize(8); doc.setTextColor(...CINZA);
    doc.text(limpar(EMPRESA.rodape), M, A - 4.3);
    if (paginas > 1) doc.text(`Página ${p} de ${paginas}`, D, A - 4.3, { align: "right" });
  }

  // Nome do arquivo: Orcamento-0001-Cliente.pdf
  const cliente = limpar(orc.cliente).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const nome = `Orcamento${orc.numero ? "-" + String(orc.numero).padStart(4, "0") : ""}-${cliente || "obra"}.pdf`;

  try {
    if (Capacitor.isNativePlatform()) {
      // No celular: grava o arquivo e abre o menu de compartilhar (WhatsApp, e-mail, Drive...)
      const base64 = doc.output("datauristring").split(",")[1];
      await Filesystem.writeFile({ path: nome, data: base64, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: nome, directory: Directory.Cache });
      await Share.share({ title: nome, url: uri, dialogTitle: "Enviar orçamento" });
    } else {
      doc.save(nome); // no computador: baixa o PDF
    }
  } catch (erro) {
    if (!String(erro?.message ?? erro).toLowerCase().includes("cancel")) alert("Não foi possível gerar o PDF.");
  }
}
