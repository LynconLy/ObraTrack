import { calcularProgresso } from "../utils";

// Usado na lista e nos detalhes: escrevemos uma vez e reaproveitamos
export default function Progresso({ obra }) {
  const p = calcularProgresso(obra);
  return (
    <>
      <div className="progresso">
        <div className="barra"><div style={{ width: `${p.percentual}%` }} /></div>
        <span className="percentual">{p.percentual}%</span>
      </div>
      <p className="suave">
        {p.feitas} de {p.total} tarefas concluídas
        {p.emAndamento > 0 && ` · ${p.emAndamento} em andamento`}
      </p>
    </>
  );
}
