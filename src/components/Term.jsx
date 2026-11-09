import { Link } from "react-router-dom";

// Uso: <Term id="cedear">CEDEAR</Term>
// Lleva al glosario, directo a esa palabra.
export default function Term({ id, children, base = "/app/glosario" }) {
  return (
    <Link className="term-link" to={`${base}#${id}`} title="Ver definición en el glosario">
      {children}
    </Link>
  );
}