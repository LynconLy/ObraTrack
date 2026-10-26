import { useState } from "react";
import TarefaItem from "./TarefaItem";
import FormTarefa from "./FormTarefa";
import { ORC_STATUS, formatarMoeda, totalOrcamento } from "../utils";
import { gerarOrcamentoPdf } from "../orcamentoPdf";

export default function DetalheOrcamento({ orc, onAtualizar, onVoltar, onTransformar, onVerObra }) {
  const [itemForm, setItemForm] = useState(null); // null = fechado | {} = novo | item = editando

  // Reaproveitamos o FormTarefa e o TarefaItem: um item de orçamento tem os mesmos campos
  // (nome, observação, valor), só não tem "status" (pendente/em andamento/concluída).
  function salvarForm(dados) {
    if (itemForm.id) onAtualizar({ itens: orc.itens.map((i) => (i.id === itemForm.id ? { ...i, ...dados } : i)) });
    else onAtualizar({ itens: [...orc.itens, { id: Date.now(), ...dados }] });
    setItemForm(null);
  }
  const excluir = (id) =>
    window.confirm("Excluir este item?") && onAtualizar({ itens: orc.itens.filter((i) => i.id !== id) });

  return (
    <section>
      <button className="btn" onClick={onVoltar}>← Voltar</button>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-topo">
          <h1>📝 {orc.nome}</h1>
          <label style={{ margin: 0 }}>Situação
            <select value={orc.status} onChange={(e) => onAtualizar({ status: e.target.value })}>
              {ORC_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="info">
          <div><b>Cliente</b><br />{orc.cliente}</div>
          <div><b>Endereço</b><br />{orc.endereco || "—"}</div>
          <div><b>Valor total</b><br />{formatarMoeda(totalOrcamento(orc))}</div>
          <div><b>Descrição</b><br />{orc.descricao || "—"}</div>
        </div>
        {orc.obraId ? (
          <button className="btn primario" style={{ width: "100%" }} onClick={() => onVerObra(orc.obraId)}>Ver obra criada</button>
        ) : (
          <button className="btn primario" style={{ width: "100%" }} disabled={orc.itens.length === 0}
                  onClick={() => window.confirm("Transformar este orçamento em obra?") && onTransformar(orc)}>
            ✅ Transformar em obra
          </button>
        )}
        <button className="btn" style={{ width: "100%", marginTop: 10 }} disabled={orc.itens.length === 0}
                onClick={() => gerarOrcamentoPdf(orc)}>
          📄 Gerar orçamento (PDF)
        </button>
      </div>

      <div className="tarefas-topo">
        <h2>Itens</h2>
        <button className="btn primario" onClick={() => setItemForm({})}>+ Adicionar item</button>
      </div>
      {orc.itens.length === 0 && <p className="vazio">Sem itens. Toque em "+ Adicionar item".</p>}
      {orc.itens.map((i) => (
        <TarefaItem key={i.id} tarefa={i} onEditar={() => setItemForm(i)} onExcluir={() => excluir(i.id)} />
      ))}
      {itemForm && <FormTarefa tarefa={itemForm.id ? itemForm : null} onSalvar={salvarForm} onCancelar={() => setItemForm(null)} />}
    </section>
  );
}
