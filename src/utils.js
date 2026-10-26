// Funções e constantes reaproveitadas do projeto antigo (JS puro).
// "export" permite usar cada uma em outros arquivos com "import".

export const STATUS = ["Planejada", "Em andamento", "Pausada", "Concluída"];
export const ICONES = ["🏠", "🏢", "🏗️", "🏭", "🏪", "🧱", "🔨", "🛠️", "🚧", "🎨", "🚿", "⚡"];
export const SIMBOLO = { pendente: "○", andamento: "◐", concluida: "✔" };
export const PROXIMO_STATUS = { pendente: "andamento", andamento: "concluida", concluida: "pendente" };
const PESO_ANDAMENTO = 0.5; // quanto uma tarefa "em andamento" conta no percentual

export function calcularProgresso(obra) {
  const total = obra.tarefas.length;
  const concluidas = obra.tarefas.filter((t) => t.status === "concluida");
  const emAndamento = obra.tarefas.filter((t) => t.status === "andamento").length;
  const feitas = concluidas.length;
  const percentual = total === 0 ? 0
    : Math.min(100, Math.round(((feitas + emAndamento * PESO_ANDAMENTO) / total) * 100));
  const receber = concluidas.reduce((soma, t) => soma + t.valor, 0);
  return { total, feitas, emAndamento, percentual, receber };
}

export const formatarMoeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function formatarData(data) {
  if (!data) return "—";
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

// Cor da etiqueta de status (serve para obras e para orçamentos)
export const classeStatus = (s) =>
  ({ "Em andamento": "andamento", "Concluída": "concluida", "Pausada": "pausada",
     "Enviado": "andamento", "Aprovado": "concluida", "Recusado": "pausada" }[s] || "");

/* ---------- ORÇAMENTOS ---------- */
export const ORC_STATUS = ["Rascunho", "Enviado", "Aprovado", "Recusado"];

// Total do orçamento = soma do valor de todos os itens
export const totalOrcamento = (orc) => orc.itens.reduce((soma, i) => soma + i.valor, 0);

// Cria uma obra a partir do orçamento: cada item vira uma tarefa pendente com o mesmo valor
export function orcamentoParaObra(orc) {
  return {
    id: Date.now(), orcamentoId: orc.id, numeroOrcamento: orc.numero, status: "Planejada", icone: "🏠", inicio: "", termino: "",
    nome: orc.nome, cliente: orc.cliente, telefone: orc.telefone, endereco: orc.endereco, descricao: orc.descricao,
    tarefas: orc.itens.map((i) => ({ ...i, status: "pendente" })),
  };
}

// Monta o link do WhatsApp com a mensagem pronta para o cliente
export function linkWhatsApp(obra) {
  let numero = (obra.telefone || "").replace(/\D/g, "");
  if (numero.length === 10 || numero.length === 11) numero = "55" + numero;
  const p = calcularProgresso(obra);
  const andamento = obra.tarefas.filter((t) => t.status === "andamento").map((t) => `• ${t.titulo}`);
  let msg = `Olá, ${obra.cliente}! Atualização da obra *${obra.nome}*:\n\n`
    + `📊 Progresso: *${p.percentual}%* (${p.feitas} de ${p.total} tarefas concluídas)`;
  if (andamento.length) msg += `\n\n🔨 Em andamento:\n${andamento.join("\n")}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}
