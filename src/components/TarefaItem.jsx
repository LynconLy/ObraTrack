import { SIMBOLO, formatarMoeda } from "../utils";

export default function TarefaItem({ tarefa: t, onAlternar, onEditar, onExcluir }) {
  return (
    <div className={`tarefa ${t.status ?? ""}`}>
      {t.status && <button type="button" className={`estado ${t.status}`} onClick={onAlternar}>{SIMBOLO[t.status]}</button>}
      <div className="texto">
        <span className="nome">{t.titulo}</span>
        {t.observacao && <p className="obs">{t.observacao}</p>}
        <p className="valor">{formatarMoeda(t.valor)}</p>
      </div>
      <div className="acoes">
        <button className="btn pequeno" onClick={onEditar}>Editar</button>
        <button className="btn pequeno perigo" onClick={onExcluir}>Excluir</button>
      </div>
    </div>
  );
}
