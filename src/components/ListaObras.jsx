import Progresso from "./Progresso";
import { classeStatus } from "../utils";

// "props" são os parâmetros do componente: dados (obras) e funções (onAbrir, onNova) vindos do App
export default function ListaObras({ obras, onAbrir, onNova }) {
  return (
    <section>
      <div className="titulo-linha">
        <h1>Minhas Obras</h1>
        <button className="btn primario" onClick={onNova}>+ Nova Obra</button>
      </div>
      {obras.length === 0 && <p className="vazio">Nenhuma obra ainda. Toque em "+ Nova Obra".</p>}
      <div className="grade">
        {/* .map cria um card para cada obra; "key" ajuda o React a identificar cada um */}
        {obras.map((obra) => (
          <article className="card" key={obra.id}>
            <div className="card-topo">
              <div>
                <h3>{obra.icone} {obra.nome}</h3>
                <p className="suave">Cliente: {obra.cliente}</p>
              </div>
              <span className={`status ${classeStatus(obra.status)}`}>{obra.status}</span>
            </div>
            <Progresso obra={obra} />
            <button className="btn primario" style={{ width: "100%", marginTop: 10 }} onClick={() => onAbrir(obra.id)}>
              Ver obra
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
