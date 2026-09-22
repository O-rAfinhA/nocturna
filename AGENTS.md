# Nocturna — instruções para o Codex

Leia `CONTEXTO-PARA-CODEX.md` e `README.md` antes de alterar o projeto.

- Converse com o usuário em português. A interface para visitantes tem PT, EN e ES; preserve os três idiomas em alterações de texto e navegação.
- Este é um protótipo local. Não publique nem configure anúncios sem solicitação explícita do usuário.
- Preserve `content/stories.json` e a pasta `data/`: podem conter trabalho editorial, senha administrativa e comentários criados no computador do usuário. Nunca substitua esses arquivos pelos exemplos ou pelo catálogo vazio de um arquivo ZIP. Faça cópia antes de qualquer migração de dados.
- Nunca adicione `data/` a um repositório ou compartilhe senha, sessões e comentários em respostas, commits ou logs. Antes de criar um repositório remoto, revise se `content/stories.json` contém rascunhos ou conteúdo que não deve ser público; a pasta `dist/` também pode conter páginas geradas a partir de histórias publicadas.
- Requisitos locais: Node.js 20+ e Python 3. No Windows, na raiz do projeto, gere as páginas com `py -3 build_pages.py` e inicie com `node server.mjs`. A administração fica em `/admin/` e o site em `/` na porta 8000.
- `build_pages.py` regenera as páginas de PT/EN/ES e os caminhos de histórias/localidades dentro de `dist/`. Depois de mudar o modelo ou os textos de páginas geradas, rode o gerador e verifique as rotas.
- O catálogo editorial fica em `content/stories.json`; só itens `status: "published"` são públicos. Não invente fontes nem publique histórias de demonstração como fatos reais. O usuário adiou a escolha das histórias reais.
- Os comentários dependem de aprovação administrativa e a exibição regional compara a posição aproximada no navegador.
- Esta versão usa Open-Meteo gratuita para busca e blocos comunitários do OpenStreetMap no modo mapa; antes de um lançamento monetizado, substitua por soluções com condições apropriadas para produção. O servidor JSON local não foi preparado para hospedagem pública ou múltiplas instâncias.
- Antes de finalizar uma mudança, rode `node --check` nos arquivos JavaScript editados, `py -3 build_pages.py` no Windows (ou `python3 build_pages.py` em Linux) quando necessário e teste o fluxo alterado de modo significativo. Não apague dados reais de teste.
