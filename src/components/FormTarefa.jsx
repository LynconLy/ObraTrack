import { useState } from "react";
import Modal from "./Modal";

// tarefa = null → criando; tarefa = {...} → editando (os campos já vêm preenchidos)
export default function FormTarefa({ tarefa, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [observacao, setObservacao] = useState(tarefa?.observacao ?? "");
  const [valor, setValor] = useState(tarefa?.valor || "");

  function enviar(e) {
    e.preventDefault();
    onSalvar({ titulo: titulo.trim(), observacao: observacao.trim(), valor: Number(valor) || 0 });
  }

  return (
    <Modal titulo={tarefa ? "Editar tarefa" : "Nova tarefa"}>
      <form onSubmit={enviar}>
        <label>Nome da tarefa <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required /></label>
        <label>Observação <input value={observacao} onChange={(e) => setObservacao(e.target.value)} /></label>
        <label>Valor (R$) <input type="number" min="0" step="0.01" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} /></label>
        <div className="botoes">
          <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primario">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}
