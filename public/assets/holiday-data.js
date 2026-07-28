(() => {
  "use strict";

  const fixed = (date, name, legalBasis) => ({ date, name, legalBasis });

  window.PRAZO_HOLIDAYS = {
    national: [
      fixed("01-01", "Confraternização Universal", "Lei 662/1949"),
      fixed("04-21", "Tiradentes", "Lei 10.607/2002"),
      fixed("05-01", "Dia Mundial do Trabalho", "Lei 10.607/2002"),
      fixed("09-07", "Independência do Brasil", "Lei 10.607/2002"),
      fixed("10-12", "Nossa Senhora Aparecida", "Lei 6.802/1980"),
      fixed("11-02", "Finados", "Lei 10.607/2002"),
      fixed("11-15", "Proclamação da República", "Lei 10.607/2002"),
      fixed("11-20", "Dia Nacional de Zumbi e da Consciência Negra", "Lei 14.759/2023"),
      fixed("12-25", "Natal", "Lei 10.607/2002")
    ],

    state: {
      AC: [
        fixed("01-20", "Dia do Católico", "feriado estadual"),
        fixed("01-23", "Dia do Evangélico", "feriado estadual"),
        fixed("03-08", "Dia Internacional da Mulher", "feriado estadual"),
        fixed("06-15", "Aniversário do Estado do Acre", "data magna estadual"),
        fixed("09-05", "Dia da Amazônia", "feriado estadual"),
        fixed("11-17", "Tratado de Petrópolis", "feriado estadual")
      ],
      AL: [
        fixed("06-24", "São João", "feriado estadual"),
        fixed("06-29", "São Pedro", "feriado estadual"),
        fixed("09-16", "Emancipação Política de Alagoas", "data magna estadual"),
        fixed("11-30", "Dia do Evangélico", "feriado estadual")
      ],
      AP: [
        fixed("03-19", "Dia de São José", "feriado estadual"),
        fixed("05-15", "Dia de Cabralzinho", "feriado estadual"),
        fixed("09-13", "Criação do Território Federal do Amapá", "data magna estadual")
      ],
      AM: [fixed("09-05", "Elevação do Amazonas à categoria de província", "data magna estadual")],
      BA: [fixed("07-02", "Independência da Bahia", "data magna estadual")],
      CE: [
        fixed("03-19", "Dia de São José", "feriado estadual"),
        fixed("03-25", "Data Magna do Ceará", "Emenda Constitucional estadual 73/2011")
      ],
      MA: [fixed("07-28", "Adesão do Maranhão à Independência", "data magna estadual")],
      MS: [fixed("10-11", "Criação do Estado de Mato Grosso do Sul", "data magna estadual")],
      PA: [fixed("08-15", "Adesão do Pará à Independência", "data magna estadual")],
      PB: [fixed("08-05", "Emancipação Política da Paraíba", "Lei estadual 10.601/2015")],
      PE: [fixed("03-06", "Revolução Pernambucana de 1817", "data magna estadual")],
      PI: [fixed("10-19", "Dia do Piauí", "data magna estadual")],
      RJ: [fixed("04-23", "Dia de São Jorge", "Lei estadual 5.198/2008")],
      RN: [fixed("10-03", "Mártires de Cunhaú e Uruaçu", "feriado estadual")],
      RO: [fixed("01-04", "Criação do Estado de Rondônia", "data magna estadual")],
      RR: [fixed("10-05", "Criação do Estado de Roraima", "data magna estadual")],
      RS: [fixed("09-20", "Revolução Farroupilha", "data magna estadual")],
      SE: [fixed("07-08", "Emancipação Política de Sergipe", "data magna estadual")],
      SP: [fixed("07-09", "Revolução Constitucionalista de 1932", "Lei estadual 9.497/1997")],
      TO: [
        fixed("03-18", "Autonomia do Tocantins", "feriado estadual"),
        fixed("08-15", "Senhor do Bonfim", "feriado estadual"),
        fixed("09-08", "Nossa Senhora da Natividade", "feriado estadual"),
        fixed("10-05", "Criação do Estado do Tocantins", "data magna estadual")
      ]
    },

    municipalities: {
      "Aracaju|SE": [fixed("03-17", "Aniversário de Aracaju", "feriado municipal"), fixed("06-24", "São João", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Belém|PA": [fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Belo Horizonte|MG": [fixed("08-15", "Nossa Senhora da Boa Viagem", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Boa Vista|RR": [fixed("01-20", "São Sebastião", "feriado municipal"), fixed("06-29", "São Pedro", "feriado municipal"), fixed("07-09", "Aniversário de Boa Vista", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Brasília|DF": [fixed("11-30", "Dia do Evangélico", "feriado distrital")],
      "Cuiabá|MT": [fixed("04-08", "Aniversário de Cuiabá", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Curitiba|PR": [fixed("09-08", "Nossa Senhora da Luz dos Pinhais", "feriado municipal")],
      "Florianópolis|SC": [fixed("03-23", "Emancipação de Florianópolis", "feriado municipal")],
      "Fortaleza|CE": [fixed("08-15", "Nossa Senhora da Assunção", "Lei municipal 8.796/2003")],
      "Goiânia|GO": [fixed("05-24", "Nossa Senhora Auxiliadora", "feriado municipal"), fixed("10-24", "Aniversário de Goiânia", "Lei municipal 6.968/1991")],
      "João Pessoa|PB": [fixed("06-24", "São João", "feriado municipal"), fixed("08-05", "Nossa Senhora das Neves e aniversário de João Pessoa", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Macapá|AP": [fixed("02-04", "Aniversário de Macapá", "feriado municipal")],
      "Maceió|AL": [fixed("08-27", "Nossa Senhora dos Prazeres", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Manaus|AM": [fixed("10-24", "Aniversário de Manaus", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Natal|RN": [fixed("01-06", "Santos Reis", "feriado municipal"), fixed("11-21", "Nossa Senhora da Apresentação", "feriado municipal")],
      "Palmas|TO": [fixed("03-19", "São José", "feriado municipal"), fixed("05-20", "Aniversário de Palmas", "feriado municipal")],
      "Porto Alegre|RS": [fixed("02-02", "Nossa Senhora dos Navegantes", "feriado municipal")],
      "Porto Velho|RO": [fixed("01-24", "Instalação de Porto Velho", "feriado municipal"), fixed("05-24", "Nossa Senhora Auxiliadora", "feriado municipal"), fixed("10-02", "Criação de Porto Velho", "feriado municipal")],
      "Recife|PE": [fixed("06-24", "São João", "feriado municipal"), fixed("07-16", "Nossa Senhora do Carmo", "Lei municipal 9.777/1967"), fixed("12-08", "Nossa Senhora da Conceição", "Lei municipal 9.777/1967")],
      "Rio Branco|AC": [fixed("12-28", "Aniversário de Rio Branco", "feriado municipal")],
      "Rio de Janeiro|RJ": [fixed("01-20", "São Sebastião", "feriado municipal")],
      "Salvador|BA": [fixed("06-24", "São João", "Lei municipal 1.997/1967"), fixed("12-08", "Nossa Senhora da Conceição da Praia", "Lei municipal 1.997/1967")],
      "São Luís|MA": [fixed("06-29", "São Pedro", "feriado municipal"), fixed("09-08", "Aniversário de São Luís e Natividade de Nossa Senhora", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "São Paulo|SP": [fixed("01-25", "Aniversário de São Paulo", "feriado municipal")],
      "Teresina|PI": [fixed("08-16", "Aniversário de Teresina", "feriado municipal"), fixed("12-08", "Imaculada Conceição", "feriado municipal")],
      "Vitória|ES": [fixed("09-08", "Nossa Senhora da Vitória e aniversário de Vitória", "feriado municipal")]
    }
  };
})();
