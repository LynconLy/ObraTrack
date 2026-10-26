import { useState } from "react";
import Modal from "./Modal";
import Progresso from "./Progresso";
import TarefaItem from "./TarefaItem";
import FormTarefa from "./FormTarefa";
import { gerarOrcamentoPdf, obraComoOrcamento } from "../orcamentoPdf";
import { STATUS, ICONES, PROXIMO_STATUS, calcularProgresso, formatarMoeda, formatarData, linkWhatsApp } from "../utils";

export default function DetalheObra({ obra, onAtualizar, onVoltar, onExcluir}) {
  const [tarefaForm, setTarefaForm] = useState(null); // null = fechado | {} = nova | tarefa = editando
  const [escolhendoIcone, setEscolhendoIcone] = useState(false);
  const p = calcularProgresso(obra);

  // Toda mudança de tarefas passa por aqui: salva a lista nova e ajusta o status da obra
  function salvarTarefas(tarefas) {
    const { total, feitas } = calcularProgresso({ ...obra, tarefas });
    let status = obra.status;
    if (total > 0 && feitas === total) status = "Concluída";
    else if (status === "Concluída") status = "Em andamento";
    onAtualizar({ tarefas, status });
  }

  const alternar = (id) =>
    salvarTarefas(obra.tarefas.map((t) => (t.id === id ? { ...t, status: PROXIMO_STATUS[t.status] } : t)));

  const excluir = (id) =>
    window.confirm("Excluir esta tarefa?") && salvarTarefas(obra.tarefas.filter((t) => t.id !== id));

  function salvarForm(dados) {
    if (tarefaForm.id) salvarTarefas(obra.tarefas.map((t) => (t.id === tarefaForm.id ? { ...t, ...dados } : t)));
    else salvarTarefas([...obra.tarefas, { id: Date.now(), status: "pendente", ...dados }]);
    setTarefaForm(null);
  }

  return (
    <section>
      <button className="btn" onClick={onVoltar}>← Voltar</button>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-topo">
          <h1>
            <button type="button" className="icone-obra" onClick={() => setEscolhendoIcone(true)}>{obra.icone}</button> {obra.nome}
          </h1>
          <label style={{ margin: 0 }}>Status
            <select value={obra.status} onChange={(e) => onAtualizar({ status: e.target.value })}>
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="info">
          <div><b>Cliente</b><br />{obra.cliente}</div>
          <div><b>Endereço</b><br />{obra.endereco || "—"}</div>
          <div><b>Início</b><br />{formatarData(obra.inicio)}</div>
          <div><b>Previsão de término</b><br />{formatarData(obra.termino)}</div>
          <div><b>Total a receber</b><br />{formatarMoeda(p.receber)}</div>
          <div><b>Descrição</b><br />{obra.descricao || "—"}</div>
        </div>
        <Progresso obra={obra} />
        <div className="botoes">
          <button className="btn primario" onClick={() => window.open(linkWhatsApp(obra), "_blank")}>
            📲 Atualizar cliente
          </button>
          <button className="btn" onClick={() => gerarOrcamentoPdf(obraComoOrcamento(obra))}>
            📄 Gerar orçamento
          </button>
        </div>
      </div>

      <div className="tarefas-topo">
        <h2>Tarefas</h2>
        <button className="btn primario" onClick={() => setTarefaForm({})}>+ Adicionar tarefa</button>
      </div>
      {obra.tarefas.length === 0 && <p className="vazio">Sem tarefas. Toque em "+ Adicionar tarefa".</p>}
      {obra.tarefas.map((t) => (
        <TarefaItem key={t.id} tarefa={t}
          onAlternar={() => alternar(t.id)} onEditar={() => setTarefaForm(t)} onExcluir={() => excluir(t.id)} />
      ))}

      <button className="btn perigo" style={{ width: "100%", marginTop: 24 }}
            onClick={() => window.confirm(`Excluir a obra "${obra.nome}"? Isso apaga todas as tarefas e não pode ser desfeito.`) && onExcluir()}>
        🗑️ Excluir obra
      </button>

      {tarefaForm && (
        <FormTarefa tarefa={tarefaForm.id ? tarefaForm : null} onSalvar={salvarForm} onCancelar={() => setTarefaForm(null)} />
      )}
      {escolhendoIcone && (
        <Modal titulo="Escolha o ícone">
          <div className="grade-icones">
            {ICONES.map((ic) => (
              <button type="button" key={ic} className="op-icone-btn"
                      onClick={() => { onAtualizar({ icone: ic }); setEscolhendoIcone(false); }}>{ic}</button>
            ))}
          </div>
          <div className="botoes"><button className="btn" onClick={() => setEscolhendoIcone(false)}>Cancelar</button></div>
        </Modal>
      )}
    </section>
  );
}
