import { useState, useEffect } from "react";
import ListaObras from "./components/ListaObras";
import DetalheObra from "./components/DetalheObra";
import ListaOrcamentos from "./components/ListaOrcamentos";
import DetalheOrcamento from "./components/DetalheOrcamento";
import FormObra from "./components/FormObra";
import { orcamentoParaObra } from "./utils";
import "./extra.css";

// Duas listas salvas no aparelho. A chave das obras é a mesma de antes: nada se perde.
const CHAVE_OBRAS = "obratrack-obras";
const CHAVE_ORC = "obratrack-orcamentos";

function carregarObras() {
  const salvas = JSON.parse(localStorage.getItem(CHAVE_OBRAS)) ?? [];
  return salvas.map((o) => ({
    icone: "🏠", telefone: "", ...o,
    tarefas: o.tarefas.map((t) => ({ valor: 0, status: t.concluida ? "concluida" : "pendente", ...t })),
  }));
}
// Orçamentos antigos, sem número, recebem um pela ordem em que foram criados
const carregarOrcamentos = () =>
  (JSON.parse(localStorage.getItem(CHAVE_ORC)) ?? []).map((o, i) => ({ numero: i + 1, ...o }));

export default function App() {
  const [obras, setObras] = useState(carregarObras);
  const [orcamentos, setOrcamentos] = useState(carregarOrcamentos);
  const [aba, setAba] = useState("orcamentos");   // qual área está aberta
  const [abertoId, setAbertoId] = useState(null); // id do orçamento/obra aberto (null = mostra a lista)
  const [criando, setCriando] = useState(false);

  // Cada lista é salva sozinha sempre que muda
  useEffect(() => { localStorage.setItem(CHAVE_OBRAS, JSON.stringify(obras)); }, [obras]);
  useEffect(() => { localStorage.setItem(CHAVE_ORC, JSON.stringify(orcamentos)); }, [orcamentos]);

  const orcAberto = aba === "orcamentos" ? orcamentos.find((o) => o.id === abertoId) : null;
  const obraAberta = aba === "obras" ? obras.find((o) => o.id === abertoId) : null;

  const atualizarObra = (id, m) => setObras(obras.map((o) => (o.id === id ? { ...o, ...m } : o)));
  const atualizarOrc = (id, m) => setOrcamentos(orcamentos.map((o) => (o.id === id ? { ...o, ...m } : o)));

  function mudarAba(nova) { setAba(nova); setAbertoId(null); }

  function excluirObra(id) {
  setObras(obras.filter((o) => o.id !== id)); // mantém todas, menos a excluída
  // Se a obra veio de um orçamento, solta o vínculo para o botão "Transformar em obra" voltar
  setOrcamentos(orcamentos.map((o) => (o.obraId === id ? { ...o, obraId: null } : o)));
  setAbertoId(null); // volta para a lista de obras
}

  function criar(dados) {
    if (aba === "obras") setObras([...obras, { id: Date.now(), status: "Planejada", tarefas: [], ...dados }]);
    else {
      const numero = Math.max(0, ...orcamentos.map((o) => o.numero)) + 1; // próximo número do orçamento
      setOrcamentos([...orcamentos, { id: Date.now(), numero, status: "Rascunho", itens: [], ...dados }]);
    }
    setCriando(false);
  }

  // Transformar em obra: cria a obra, marca o orçamento como Aprovado e abre a obra nova
  function transformar(orc) {
    const obra = orcamentoParaObra(orc);
    setObras([...obras, obra]);
    atualizarOrc(orc.id, { status: "Aprovado", obraId: obra.id });
    setAba("obras");
    setAbertoId(obra.id);
  }

  return (
    <>
      <header className="topo"><span className="logo">🏗️ Gerenciador de Obras</span></header>
      <main>
        {aba === "orcamentos" ? (
          orcAberto ? (
            <DetalheOrcamento orc={orcAberto} onAtualizar={(m) => atualizarOrc(orcAberto.id, m)}
              onVoltar={() => setAbertoId(null)} onTransformar={transformar}
              onVerObra={(id) => { setAba("obras"); setAbertoId(id); }} />
          ) : (
            <ListaOrcamentos orcamentos={orcamentos} onAbrir={setAbertoId} onNova={() => setCriando(true)} />
          )
        ) : obraAberta ? (
          <DetalheObra obra={obraAberta} onAtualizar={(m) => atualizarObra(obraAberta.id, m)}
             onVoltar={() => setAbertoId(null)} onExcluir={() => excluirObra(obraAberta.id)} />
        ) : (
          <ListaObras obras={obras} onAbrir={setAbertoId} onNova={() => setCriando(true)} />
        )}
      </main>

      <nav className="abas">
        <button className={aba === "orcamentos" ? "ativa" : ""} onClick={() => mudarAba("orcamentos")}>📝 Orçamentos</button>
        <button className={aba === "obras" ? "ativa" : ""} onClick={() => mudarAba("obras")}>🏗️ Obras</button>
      </nav>

      {criando && <FormObra orcamento={aba === "orcamentos"} onSalvar={criar} onCancelar={() => setCriando(false)} />}
    </>
  );
}
