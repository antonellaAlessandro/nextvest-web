// Contenido de las páginas públicas de instrumentos (/instrumentos/:slug).
// Para cambiar un texto, editá acá: la página es la misma plantilla para los cuatro.

export const INSTRUMENT_INFO = {
  acciones: {
    title: "Acciones",
    icon: "M4 17l5-6 4 3 7-9",
    intro: "Una acción es una parte muy chica de una empresa. Quien la compra pasa a ser dueño de una porción.",
    how: [
      "Las empresas emiten acciones para conseguir dinero y crecer. Se compran y se venden todos los días en el mercado.",
      "El precio sube o baja según cómo le va a la empresa y qué espera la gente que le pasará. Esa variación es la que genera ganancia o pérdida.",
      "Algunas empresas, además, reparten parte de sus ganancias entre sus accionistas.",
      "Es un instrumento de riesgo más alto: el precio puede moverse mucho en poco tiempo.",
    ],
    demo: {
      chip: "Acciones",
      qty: 2,
      balance: 100000,
      rows: [
        { ticker: "GGAL", name: "Banco Galicia", price: 5120 },
        { ticker: "YPFD", name: "YPF", price: 31400 },
        { ticker: "PAMP", name: "Pampa Energía", price: 3890 },
      ],
    },
    areas: [
      { name: "Tecnología", text: "Empresas de software, dispositivos y plataformas digitales." },
      { name: "Consumo masivo", text: "Alimentos, bebidas y productos que se compran todos los días." },
      { name: "Comercio electrónico", text: "Tiendas y servicios que funcionan por internet." },
      { name: "Energía", text: "Petróleo, gas y generación eléctrica." },
      { name: "Bancos y finanzas", text: "Bancos, aseguradoras y empresas de servicios financieros." },
    ],
  },
  bonos: {
    title: "Bonos",
    icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7",
    intro: "Un bono es un préstamo: quien lo compra le presta dinero a un gobierno o a una empresa.",
    how: [
      "A cambio del préstamo, el emisor se compromete a devolver el dinero en una fecha acordada y, por lo general, a pagar intereses mientras tanto.",
      "Antes del vencimiento el bono se puede vender. Su precio cambia según las tasas de interés y la confianza que genera quien lo emitió.",
      "Suele ser menos riesgoso que una acción, pero depende de quién lo emite: no es lo mismo un gobierno estable que una empresa con dificultades.",
    ],
    demo: {
      chip: "Bonos",
      qty: 2,
      balance: 100000,
      rows: [
        { ticker: "AL30", name: "Bono 2030", price: 62300 },
        { ticker: "GD30", name: "Bono 2030 (ley NY)", price: 58900 },
        { ticker: "AL35", name: "Bono 2035", price: 54100 },
      ],
    },
    areas: [
      { name: "Sector público", text: "Bonos que emiten el Estado nacional, las provincias y los municipios para financiarse." },
      { name: "Energía e infraestructura", text: "Empresas que financian obras, redes y plantas de generación." },
      { name: "Bancos", text: "Entidades financieras que emiten bonos para prestar más." },
      { name: "Empresas en general", text: "Compañías de distintos rubros que buscan financiar su crecimiento." },
    ],
  },
  cedears: {
    title: "CEDEARs",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    intro: "Un CEDEAR es un certificado que representa una acción de una empresa del exterior y se compra en pesos en el mercado argentino.",
    how: [
      "Permite invertir en empresas de otros países, como las grandes tecnológicas de Estados Unidos, sin salir del mercado local.",
      "Su precio sigue al de la acción original y también al valor del dólar, así que puede moverse por las dos cosas.",
      "Tiene el riesgo de una acción, más el que agrega el tipo de cambio.",
    ],
    demo: {
      chip: "CEDEARs",
      qty: 2,
      balance: 100000,
      rows: [
        { ticker: "AAPL", name: "Apple", price: 18420 },
        { ticker: "KO", name: "Coca-Cola", price: 12150 },
        { ticker: "MSFT", name: "Microsoft", price: 21600 },
      ],
    },
    areas: [
      { name: "Tecnología global", text: "Grandes empresas de software, internet y dispositivos." },
      { name: "Consumo", text: "Marcas internacionales de alimentos, bebidas y ropa." },
      { name: "Salud", text: "Laboratorios y empresas de equipamiento médico." },
      { name: "Energía y finanzas del exterior", text: "Petroleras, bancos y aseguradoras de otros países." },
    ],
  },
  fci: {
    title: "FCI",
    icon: "M12 3v9h9a9 9 0 1 1-9-9zM15 3.5A9 9 0 0 1 20.5 9H15z",
    intro: "Un Fondo Común de Inversión junta el dinero de muchas personas y lo administra un equipo profesional.",
    how: [
      "Quien invierte compra una parte del fondo, llamada cuotaparte, y no los activos por separado.",
      "El equipo del fondo decide cómo repartir el dinero entre distintos activos, así el riesgo queda repartido.",
      "Según a qué se dedique el fondo, el riesgo puede ser bajo o más alto: no todos los FCI son iguales.",
    ],
    demo: {
      chip: "FCI",
      qty: 2,
      balance: 100000,
      rows: [
        { ticker: "LIQ", name: "Fondo de liquidez", price: 1850 },
        { ticker: "RFJ", name: "Fondo de renta fija", price: 2340 },
        { ticker: "MIX", name: "Fondo mixto", price: 2710 },
      ],
    },
    areas: [
      { name: "Liquidez (money market)", text: "Fondos para guardar dinero a corto plazo con poco riesgo." },
      { name: "Renta fija", text: "Fondos que invierten sobre todo en bonos." },
      { name: "Renta variable", text: "Fondos que invierten en acciones y buscan crecer más, con más riesgo." },
      { name: "Mixtos", text: "Fondos que combinan bonos y acciones." },
    ],
  },
};

export const INSTRUMENT_ORDER = ["acciones", "bonos", "cedears", "fci"];