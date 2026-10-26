import { useState } from "react";
import Modal from "./Modal";
import { ICONES } from "../utils";

export default function FormObra({ orcamento = false, onSalvar, onCancelar }) {
  const [dados, setDados] = useState({
    nome: "", cliente: "", telefone: "", endereco: "", inicio: "", termino: "", descricao: "", icone: ICONES[0],
  });

  // Um único "mudar" serve para todos os campos: usa o atributo name de cada input
  const mudar = (e) => setDados({ ...dados, [e.target.name]: e.target.value });

  function enviar(e) {
    e.preventDefault(); // impede a página de recarregar
    onSalvar({ ...dados, nome: dados.nome.trim(), cliente: dados.cliente.trim() });
  }

  return (
    <Modal titulo={orcamento ? "Novo orçamento" : "Nova obra"}>
      <form onSubmit={enviar}>
        <label>Nome da obra <input name="nome" value={dados.nome} onChange={mudar} required /></label>
        <label>Cliente <input name="cliente" value={dados.cliente} onChange={mudar} required /></label>
        <label>Telefone do cliente (WhatsApp) <input name="telefone" type="tel" inputMode="tel" value={dados.telefone} onChange={mudar} /></label>
        <label>Endereço <input name="endereco" value={dados.endereco} onChange={mudar} /></label>
        {!orcamento && (<>
        <label>Data de início <input name="inicio" type="date" value={dados.inicio} onChange={mudar} required /></label>
        <label>Previsão de término <input name="termino" type="date" value={dados.termino} onChange={mudar} /></label>
        </>)}
        <label>Descrição <textarea name="descricao" rows="3" value={dados.descricao} onChange={mudar} /></label>
        {!orcamento && (
        <div className="grade-icones">
          {ICONES.map((ic) => (
            <button type="button" key={ic} className={`op-icone-btn ${dados.icone === ic ? "marcado" : ""}`}
                    onClick={() => setDados({ ...dados, icone: ic })}>{ic}</button>
          ))}
        </div>
        )}
        <div className="botoes">
          <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primario">{orcamento ? "Criar orçamento" : "Criar obra"}</button>
        </div>
      </form>
    </Modal>
  );
}
