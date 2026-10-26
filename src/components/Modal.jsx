// Componente = função que devolve HTML (JSX). "children" é o que for colocado dentro dele.
export default function Modal({ titulo, children }) {
  return (
    <div className="modal-fundo">
      <div className="modal">
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
