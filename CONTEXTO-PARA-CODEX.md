# Nocturna — contexto para continuar em outro Codex

## Visão do produto

Nocturna é um portal de casos estranhos, insólitos e bizarros associados a lugares. O visitante não precisa de conta. Ele pode girar um globo, abrir um mapa detalhado, buscar cidades e códigos postais, selecionar um lugar e descobrir histórias e comentários próximos. A localização do navegador é opcional e só é pedida após clicar em “Minha localização”. A interface de visitantes funciona em português, inglês e espanhol, com idioma inicial escolhido pelo navegador; o seletor mostra PT, EN e ES. O visual é escuro, com clima de atlas misterioso. Futuramente o site poderá ter AdSense, mas ainda não há anúncios, domínio público definido ou publicação autorizada.

## Funcionalidade existente

- `dist/`: página inicial, estilos, scripts, páginas de privacidade e interface administrativa. O globo em canvas gira, seleciona pontos e aceita scroll para zoom. A opção Mapa detalhado usa Leaflet e blocos do OpenStreetMap; clique para selecionar ponto, scroll e botões para zoom. Se o mapa externo falhar, o globo continua.
- A busca fora das cidades de exemplo consulta Open-Meteo somente após envio do formulário, apresenta escolhas para nomes ambíguos e centra o globo/mapa. A busca gratuita é para uso local sem publicidade. GeoNames e Open-Meteo estão creditados.
- `server.mjs`: servidor Node HTTP local em `127.0.0.1:8000`; APIs de histórias e comentários, autenticação administrativa com senha protegida por scrypt e cookie de sessão. Não usa framework nem pacotes npm externos. O usuário conseguiu iniciar e entrar no painel com Node v20.20.0 e Python 3.12.10.
- `setup-admin.mjs`: cria senha do administrador. `local-store.mjs`: comentários e sessões em JSON local; usa Node 20 e substitui versão anterior com `node:sqlite` incompatível com Node 20.
- `dist/admin/`: criação e edição de histórias nos três idiomas, status rascunho/revisão/publicada, classificação documentada/relato não verificado/ficção, fontes HTTPS, cidade, região, país e coordenadas. Há opção para escolher o ponto no mapa, além dos campos manuais. Comentários entram pendentes e precisam ser aprovados ou rejeitados.
- `build_pages.py`: gera páginas iniciais e de privacidade PT/EN/ES; ao publicar histórias, gera páginas individuais e páginas por localidade, com navegação entre idiomas e diretório de lugares na página inicial. Retirar uma história de publicação remove suas páginas geradas na próxima execução.
- `content/stories.json` guarda as histórias. O ZIP produzido nesta conversa contém `[]`, mas o computador anterior pode ter histórias próprias. `content/story.schema.json` descreve a estrutura.
- Os marcadores das histórias publicadas aparecem no mapa com título e link para a página da história. Os comentários aprovados aparecem na história e na página inicial para visitantes que selecionam um ponto a até 250 km da localização aproximada da história. Essa filtragem regional ocorre no navegador.
- As seis cidades e histórias fictícias na página inicial são uma demonstração, não são histórias reais publicadas. As páginas permanecem com `noindex`; sitemap, URLs canônicas, hreflang com URLs absolutas, texto legal final e integração de anúncios aguardam domínio e conteúdo reais.

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

1. Preservar o trabalho local do usuário. O projeto ainda não está sincronizado com GitHub por esta conversa; não assumir acesso a nenhum repositório.
2. O usuário preferiu decidir as primeiras histórias reais mais tarde. Pergunte pela direção editorial quando esse trabalho se tornar necessário; mantenha nítida a distinção entre fato documentado, relato não verificado e ficção.
3. A migração para hospedagem pública exige persistência adequada, revisão da autenticação e moderação, revisão da privacidade e escolha de serviços de mapa e busca que permitam o modelo de uso e tráfego previstos. Não tratar este servidor local como pronto para deploy na Vercel.
4. Antes da indexação, remover `noindex` somente de páginas revisadas e com conteúdo real, configurar domínio, sitemap, canônicas e equivalentes PT/EN/ES. Nunca prometer posicionamento nos mecanismos de busca nem aprovação no AdSense.
5. Melhorias possíveis: backup/restauração do painel, filtros de histórias por tipo e distância, primeiras histórias reais com fontes verificadas.

## Mensagem inicial sugerida para o novo Codex

> Este é o projeto Nocturna que trouxe de outro computador. Leia `AGENTS.md`, `CONTEXTO-PARA-CODEX.md` e `README.md`. Inspecione os arquivos locais antes de editar. Confirme quais histórias e comentários existem neste computador e preserve `content/stories.json` e `data/`. Verifique a execução local com Node 20+ e Python 3, examine o estado atual e proponha o próximo passo mais útil. Não publique nem ative anúncios nesta etapa.
