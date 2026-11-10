import { Link } from "react-router-dom";
import "./Legal.css";

// Cambiá este correo por el de contacto real del proyecto.
const CONTACT_EMAIL = "antoalessandro@nextvest.com";

const PAGES = {
  terminos: {
    title: "Términos de uso",
    updated: "Noviembre de 2026",
    sections: [
      {
        h: "Qué es NextVest",
        p: [
          "NextVest es un simulador educativo de inversiones para personas de 13 a 17 años. Se opera con saldo virtual y no se mueve dinero real en ningún momento.",
        ],
      },
      {
        h: "Cuentas y autorización",
        p: [
          "Para usar NextVest hace falta registrarse con datos verdaderos y contar con la autorización de un representante legal. Hasta que esa autorización exista, la cuenta no se activa.",
          "Cada persona es responsable de mantener su contraseña en reserva.",
        ],
      },
      {
        h: "Sin asesoramiento financiero",
        p: [
          "Los instrumentos, los precios y los resultados que se muestran tienen fines educativos. Nada de lo que aparece en NextVest es una recomendación de inversión ni una oferta para operar en el mercado real.",
          "Los precios pueden tener diferencias o demoras respecto del mercado.",
        ],
      },
      {
        h: "Uso adecuado",
        p: [
          "No se permite usar la plataforma para actividades ilegales, intentar acceder a cuentas ajenas ni alterar su funcionamiento.",
          "NextVest puede suspender o rechazar cuentas que incumplan estos términos o que no cuenten con la autorización correspondiente.",
        ],
      },
      {
        h: "Cambios",
        p: ["Estos términos pueden actualizarse. La fecha de la última versión figura al comienzo de esta página."],
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    updated: "Noviembre de 2026",
    sections: [
      {
        h: "Qué datos se recopilan",
        p: [
          "Al registrarte se piden nombre, apellido, DNI, fecha de nacimiento, correo electrónico y contraseña, junto con los datos de un representante legal. Además se guardan las operaciones simuladas y el resultado del test de perfil de inversor.",
        ],
      },
      {
        h: "Para qué se usan",
        p: [
          "Los datos se usan para verificar la edad, gestionar la autorización del representante legal, hacer funcionar el simulador y mostrarte tu actividad.",
          "La contraseña se guarda protegida y no es visible para el equipo.",
        ],
      },
      {
        h: "Con quién se comparten",
        p: ["Los datos no se venden ni se ceden a terceros, salvo que una norma o una autoridad competente lo exija."],
      },
      {
        h: "Tus derechos",
        p: [
          "Podés pedir acceso, corrección o eliminación de tus datos, de acuerdo con la Ley 25.326 de Protección de los Datos Personales. Para hacerlo, escribinos a " + CONTACT_EMAIL + ".",
        ],
      },
    ],
  },
  contacto: {
    title: "Contacto",
    updated: null,
    sections: [
      {
        h: "Escribinos",
        p: [
          "Si tenés dudas sobre la plataforma, sobre una cuenta o sobre tus datos, escribinos a " + CONTACT_EMAIL + ".",
          "NextVest es un proyecto educativo: la respuesta puede demorar algunos días.",
        ],
      },
    ],
  },
};

export default function Legal({ page }) {
  const data = PAGES[page];
  return (
    <div className="legal">
      <header className="legal-top">
        <Link to="/" className="legal-logo">
          <img src="/nv-logo-blanco.svg" alt="" height="22" />
          <span>NextVest</span>
        </Link>
        <Link to="/" className="legal-back">← Volver al inicio</Link>
      </header>

      <main className="legal-main">
        <article className="legal-card">
          <h1>{data.title}</h1>
          {data.updated && <p className="legal-date">Última actualización: {data.updated}</p>}
          {data.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <footer className="legal-foot">NextVest · Simulador educativo. No se opera con dinero real.</footer>
    </div>
  );
}