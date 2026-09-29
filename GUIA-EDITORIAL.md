# Guia editorial dos dossiês do Nocturna

Siga este guia ao escrever ou revisar qualquer dossiê, seja por pessoa ou por IA. O painel e a API recusam textos fora destas regras de pontuação.

## Tom e credibilidade

- Texto de jornalismo investigativo: claro, sóbrio, respeitoso com vítimas e famílias. Sem sensacionalismo, sem fórmulas de efeito ("e é aí que tudo muda", "mas há um detalhe").
- Cada afirmação factual precisa de fonte verificável (HTTPS) listada em **Fontes**. Não invente fontes, datas, números ou citações.
- Separe sempre o que está **documentado**, o que é **disputado** e o que **não foi demonstrado**. Classificação: `documented` (documentado), `unverified` (relato não verificado) ou `fiction` (ficção).
- Escreva os três idiomas (PT, EN e ES) com o mesmo conteúdo, adaptando a naturalidade de cada língua. Não traduza nomes próprios de obras, instituições e lugares quando o original for o usual.

## Pontuação (obrigatório)

- **Não use travessão (—) nem meia-risca (–).** A API recusa o texto.
  - Explicação no meio da frase: use vírgulas ou parênteses. "O retrato repetido depois de sua morte, o da jovem que teria ido a Hollywood, é..."
  - Enumeração intercalada: parênteses. "Esses fatos (a data, as vítimas e a cena) aparecem..."
  - Conclusão ou explicação: dois-pontos ou nova frase.
  - Intervalos e nomes compostos: hífen comum. "1610-1611", "Portland-Seattle". Em prosa, prefira "entre 1987 e 1988".
  - Subtítulos: sem travessão. "## O que o arquivo diz e o que não diz".
- Aspas: “ ” em português e inglês; « » ou “ ” em espanhol.
- Evite reticências e pontos de exclamação.

## Formatação do texto (Markdown simples)

O site converte estas marcas; o leitor nunca vê os símbolos:

- `## Subtítulo` (e `### Seção` se necessário), sempre em linha própria.
- `**negrito**` para datas, números ou termos-chave, com moderação (no máximo alguns por seção).
- `*itálico*` para títulos de obras, jornais e nomes científicos.
- Listas com `- item` ou `1. item`.
- Links: `[texto](https://...)`. Prefira colocar fontes na lista **Fontes**.
- Separe parágrafos com uma linha em branco. Não use tabelas, HTML, citações com `>` nem emojis.

Estrutura recomendada: resumo de 1 a 2 frases (até 300 caracteres), texto com 4 a 7 subtítulos, e uma seção final que separe documentado, disputado e não demonstrado.

## Localização

- **Padrão: local exato.** Posicione as coordenadas no lugar do episódio e, se for um lugar público com nome conhecido, preencha **Nome ou endereço público** (ex.: "Edifício Martinelli, São Paulo"). O Street View é opcional.
- **Marque "Mostrar localização aproximada"** em crimes, locais ligados a vítimas, residências, escolas atingidas e qualquer ponto que identifique pessoas. O site publica só a região (cerca de 1 km), sem endereço nem Street View.
- Cidade, região e país sempre preenchidos.

## Texto pronto para pedir um dossiê a uma IA

> Escreva um dossiê para o Nocturna seguindo o GUIA-EDITORIAL.md: jornalismo investigativo sóbrio, fontes HTTPS verificáveis, separação entre documentado, disputado e não demonstrado; três versões (PT, EN, ES) com título, resumo de até 300 caracteres e texto em Markdown simples (## subtítulos, **negrito** com moderação, *itálico* para obras). Não use travessão (—) nem meia-risca (–): use vírgulas, parênteses, dois-pontos ou hífen. Informe o local exato (nome ou endereço público para o Google Maps) ou indique que a localização deve ser aproximada, em casos de crime, vítimas ou residências.
