# Nocturna — contexto para continuar em outro Codex

## Visão do produto

Nocturna é um portal de casos estranhos, insólitos e bizarros associados a lugares. O visitante não precisa de conta. Ele pode girar um globo, abrir um mapa detalhado, buscar cidades e códigos postais, selecionar um lugar e descobrir histórias e comentários próximos. A localização do navegador é opcional e só é pedida após clicar em “Minha localização”. A interface de visitantes funciona em português, inglês e espanhol, com idioma inicial escolhido pelo navegador; o seletor mostra PT, EN e ES. O visual é escuro, com clima de atlas misterioso. A versão online está na Vercel, com histórias e comentários no PostgreSQL; o domínio escolhido é `portalnocturna.com.br` e depende dos registros DNS da Hostinger. Anúncios e Analytics ainda não estão ativos.

## Funcionalidade existente

- `dist/`: página inicial, estilos, scripts, páginas de privacidade e interface administrativa. O globo em canvas gira, seleciona pontos e aceita scroll para zoom. A opção Mapa detalhado usa Leaflet e blocos do OpenStreetMap; clique para selecionar ponto, scroll e botões para zoom. Se o mapa externo falhar, o globo continua.
- A busca fora das cidades de exemplo consulta Open-Meteo somente após envio do formulário, apresenta escolhas para nomes ambíguos e centra o globo/mapa. A busca gratuita é para uso local sem publicidade. GeoNames e Open-Meteo estão creditados.
- `server.mjs`: servidor Node HTTP local em `127.0.0.1:8000`; APIs de histórias e comentários, autenticação administrativa com senha protegida por scrypt e cookie de sessão. Não usa framework nem pacotes npm externos. O usuário conseguiu iniciar e entrar no painel com Node v20.20.0 e Python 3.12.10.
- `setup-admin.mjs`: cria senha do administrador. `local-store.mjs`: comentários e sessões em JSON local; usa Node 20 e substitui versão anterior com `node:sqlite` incompatível com Node 20.
- `dist/admin/`: criação e edição de histórias nos três idiomas, status rascunho/revisão/publicada, classificação documentada/relato não verificado/ficção, fontes HTTPS, cidade, região, país e coordenadas. Há opção para escolher o ponto no mapa, além dos campos manuais. Comentários entram pendentes e precisam ser aprovados ou rejeitados.
- `build_pages.py`: gera páginas iniciais e de privacidade PT/EN/ES; ao publicar histórias, gera páginas individuais e páginas por localidade, com navegação entre idiomas e diretório de lugares na página inicial. Retirar uma história de publicação remove suas páginas geradas na próxima execução.
- `content/stories.json` guarda as histórias. O ZIP produzido nesta conversa contém `[]`, mas o computador anterior pode ter histórias próprias. `content/story.schema.json` descreve a estrutura.
- Os marcadores das histórias publicadas aparecem no mapa com título e link para a página da história. Os comentários aprovados aparecem na história e na página inicial para visitantes que selecionam um ponto a até 250 km da localização aproximada da história. Essa filtragem regional ocorre no navegador.
- A versão online carrega as histórias publicadas do PostgreSQL. As páginas de histórias e localidades são geradas em HTML pela API e o sitemap dinâmico inclui somente conteúdo publicado, nos três idiomas. As páginas de privacidade permanecem sem indexação enquanto faltam o contato público e os dados do responsável.

## Arquivos e dados ao mudar de computador

**O ZIP de código não contém os dados criados no computador anterior.** Se houver histórias próprias, transfira `content/stories.json` da instalação anterior e mantenha a versão mais atual; não sobrescreva com o `[]` do ZIP. Se houver comentários, transfira em privado `data/state.json`. Para manter a senha administrativa anterior, transfira também `data/admin.json` em privado; se não quiser trazer a senha anterior, execute `node setup-admin.mjs` na nova instalação. A pasta `data/` é ignorada pelo Git e nunca deve ser publicada. Faça cópia dos arquivos antigos antes da transferência.

Depois de extrair o ZIP na máquina nova, copie os dados próprios sobre a cópia vazia, abra PowerShell na pasta `nocturna` e execute:

```powershell
node --version
py --version
py -3 build_pages.py
node setup-admin.mjs  # apenas se não trouxe data/admin.json
node server.mjs
```

Acesse `http://localhost:8000/` e `http://localhost:8000/admin/`. Se houver um servidor Python antigo na porta 8000, pare-o com Ctrl+C. Não execute `node server.mjs` dentro de `dist`.

## Restrições e próximos passos

1. Preservar o trabalho local do usuário. O código está sincronizado com `https://github.com/O-rAfinhA/nocturna`; histórias, senhas, sessões e comentários não devem entrar no GitHub.
2. O catálogo online contém histórias reais e relatos classificados; manter a distinção entre fato documentado, relato não verificado e ficção.
3. A versão pública usa Functions da Vercel e PostgreSQL do Neon. O `server.mjs` continua exclusivo para uso local. Antes de monetizar, concluir privacidade e substituir os serviços gratuitos de busca/mapa conforme os termos de uso.
4. O domínio, sitemap, canônicas e equivalentes PT/EN/ES estão configurados no código. Confirmar DNS e páginas online antes de enviar sitemap ao Search Console. Nunca prometer posicionamento nos mecanismos de busca nem aprovação no AdSense.
5. Google Analytics e AdSense aguardam os IDs do usuário; contato público e identificação do responsável também ficaram pendentes por escolha dele. Não inventar dados nem ativar anúncios antes dessas decisões.

## Mensagem inicial sugerida para o novo Codex

> Este é o projeto Nocturna. Leia `AGENTS.md`, `CONTEXTO-PARA-CODEX.md` e `README.md`. Inspecione os arquivos locais antes de editar. Preserve `content/stories.json` e `data/`; não envie dados editoriais ou privados ao GitHub. Verifique o estado da Vercel, Neon e DNS antes de mudanças públicas. Não ative anúncios sem os dados e a autorização necessários.
