import { useState } from "react";
import { ORC_STATUS, classeStatus, formatarMoeda, totalOrcamento } from "../utils";

export default function ListaOrcamentos({ orcamentos, onAbrir, onNova }) {
  const [filtro, setFiltro] = useState("Todos");
  // Mostra só os orçamentos da situação escolhida (ou todos)
  const visiveis = filtro === "Todos" ? orcamentos : orcamentos.filter((o) => o.status === filtro);

  return (
    <section>
      <div className="titulo-linha">
        <h1>Orçamentos</h1>
        <button className="btn primario" onClick={onNova}>+ Novo Orçamento</button>
      </div>
      <label>Mostrar
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          {["Todos", ...ORC_STATUS].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {visiveis.length === 0 && <p className="vazio">Nenhum orçamento aqui. Toque em "+ Novo Orçamento".</p>}
      <div className="grade">
        {visiveis.map((orc) => (
          <article className="card" key={orc.id}>
            <div className="card-topo">
              <div>
                <h3>📝 {orc.nome}</h3>
                <p className="suave">Cliente: {orc.cliente}</p>
              </div>
              <span className={`status ${classeStatus(orc.status)}`}>{orc.status}</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "12px 0 4px" }}>{formatarMoeda(totalOrcamento(orc))}</p>
            <p className="suave">{orc.itens.length} {orc.itens.length === 1 ? "item" : "itens"}</p>
            <button className="btn primario" style={{ width: "100%", marginTop: 10 }} onClick={() => onAbrir(orc.id)}>
              Abrir orçamento
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
