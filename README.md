# Nocturna — primeira versão

Página inicial estática do atlas interativo, em português, inglês e espanhol. Esta versão contém apenas histórias fictícias de demonstração. Nenhuma conta, anúncio ou serviço de análise está integrado.

Se você abrir este projeto com outro Codex, leia `AGENTS.md` e `CONTEXTO-PARA-CODEX.md` para conhecer as decisões anteriores e preservar dados transferidos do computador antigo.

Para preparar uma publicação na Vercel com banco de dados para comentários e administração, siga [DEPLOYMENT.md](DEPLOYMENT.md). O servidor local continua sendo a opção adequada para desenvolvimento sem banco remoto.

As páginas locais ficam em `/pt/`, `/en/` e `/es/`, com páginas de privacidade correspondentes em `/pt/privacidade.html`, `/en/privacidade.html` e `/es/privacidade.html`. Histórias publicadas ganham páginas individuais e páginas por localidade, como `/pt/locais/curitiba-parana-brasil/`, `/en/places/curitiba-parana-brasil/` e `/es/lugares/curitiba-parana-brasil/`. Todas têm `noindex` enquanto o conteúdo e o endereço público não estiverem prontos. Não há sitemap nem URLs canônicas nesta fase.

Ao abrir `/`, o idioma segue o navegador: português para `pt`, espanhol para `es` e inglês para os demais. Os caminhos explícitos preservam o idioma indicado neles. A troca manual na página não salva uma preferência no dispositivo.

## Executar

Para testar apenas a página estática, a pasta `dist` pode ser servida com Python. **Para cadastrar histórias e receber/moderar comentários, use o servidor Node.js 20 ou superior**, além de Python 3 para a geração das páginas. Na pasta `nocturna`, execute:

```text
node setup-admin.mjs
node server.mjs
```

No Windows, você também pode dar dois cliques em `start-nocturna.cmd` na pasta `nocturna`: ele verifica as ferramentas, solicita a senha no primeiro acesso e inicia o servidor. Abra `http://localhost:8000` para os visitantes e `http://localhost:8000/admin/` para o administrador. Pare o servidor Python anterior com **Ctrl+C** antes de iniciar o Node na mesma porta. Execute os comandos na pasta `nocturna`, não dentro de `dist`. A senha é criada uma vez pelo script de configuração e não deve ser compartilhada. A geolocalização do navegador exige contexto seguro (`localhost` ou HTTPS) e só é solicitada após clicar no botão correspondente.

O servidor escuta apenas em `127.0.0.1`. Os comentários e sessões ficam em `data/state.json`; a senha protegida fica em `data/admin.json`. Esses dados não entram no pacote de código: faça cópia da pasta `data/` para preservar comentários e credenciais. `content/stories.json` é a cópia editorial local e também deve ser preservado; após a migração para o banco, ele não precisa permanecer no GitHub. Este servidor local precisa de adaptação de persistência e hospedagem antes de ser publicado na Vercel; não execute esta versão Node como serviço público sem esse trabalho.

## Arquivos

- `dist/index.html`: estrutura da página e metadados básicos.
- `dist/styles.css`: aparência responsiva.
- `dist/app.js`: globo, seleção, busca, relatos fictícios e traduções.
- `build_pages.py`: gera páginas estáticas dos três idiomas, páginas de histórias publicadas e páginas por localidade.
- `content/story.schema.json`: campos e classificações previstos para histórias futuras.
- `content/stories.json`: catálogo editorial, atualmente vazio. Apenas registros com `status: "published"` geram páginas; registros publicados exigem texto nos três idiomas e fontes para casos classificados como documentados.
- `server.mjs`: servidor local, autenticação do administrador e APIs de histórias e comentários.
- `local-store.mjs`: armazenamento local dos comentários e sessões, sem dependências externas.
- `setup-admin.mjs`: cadastro local da senha do administrador.
- `dist/admin/`: interface de publicação e moderação.

O globo solicita os contornos publicados no pacote `world-atlas` pela CDN jsDelivr. Se a rede não permitir esse recurso, o globo continua com grade, marcadores e seleção. A aba **Mapa detalhado** carrega a biblioteca Leaflet 1.9.4 pela jsDelivr e os blocos da região exibida do OpenStreetMap somente após o visitante clicar nela. Permite ampliar até o nível das ruas e escolher qualquer ponto com um clique, usando as coordenadas para ordenar histórias e filtrar comentários da região. Cada história editorial publicada aparece como um ponto vermelho no mapa: clique no ponto para abrir o título e o link da história no idioma atual. Rascunhos e histórias em revisão não aparecem. Enquanto não houver histórias publicadas, nenhum desses pontos será exibido. O globo permanece acessível se a conexão do mapa falhar. A marcação mostra cinco casas decimais no modo mapa, mas o mapa não aumenta a precisão real da localização concedida pelo dispositivo.

Ao enviar uma busca de cidade ou código postal fora dos exemplos, o navegador consulta a [API de geocodificação Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), baseada nos dados [GeoNames](https://www.geonames.org/export/). A busca retorna opções quando há mais de um lugar com o mesmo nome; escolha uma para mover o globo ou mapa e ordenar as histórias. Nada é enviado durante a digitação. Se a busca externa falhar, as seis cidades de exemplo e a seleção no globo ou mapa continuam disponíveis. Esta integração gratuita é somente para o protótipo local sem publicidade: os [termos da Open-Meteo](https://open-meteo.com/en/terms) consideram sites com anúncios uso comercial, que requer um serviço ou plano comercial antes da publicação monetizada. Atribuição aos fornecedores aparece no rodapé.

O zoom funciona pelos botões `+` e `−` ou pela roda do mouse enquanto o cursor está sobre o globo ou o mapa. Fora dessa área, a página rola normalmente. O mapa requer conexão com a internet. Os blocos do OpenStreetMap têm atribuição visível e recebem solicitações apenas da área exibida; o fornecedor pode inferir a região visualizada a partir dos blocos. Antes de publicar o site com AdSense e tráfego real, configure um provedor de blocos apropriado para produção e revise os termos de uso, limites, atribuição e aviso de privacidade. O servidor comunitário do OpenStreetMap não oferece garantia de disponibilidade.

## Próximas etapas

Criar o catálogo editorial de histórias reais, as páginas individuais e por localidade, o SEO internacional completo e os textos legais finais com os dados reais do responsável. A integração de AdSense fica para uma fase separada.

A estrutura para páginas individuais e por localidade já está preparada pelo gerador, mas nenhuma história editorial foi publicada nesta cópia do projeto. Os relatos fictícios da tela inicial ainda servem apenas para testar a interface e não entram no catálogo. Quando uma história é publicada, sua localidade aparece no diretório da página inicial; histórias da mesma cidade, região e país são reunidas. Rascunhos e casos em revisão não geram páginas públicas. Ao retirar uma história de publicação, a próxima geração remove a página antiga e atualiza o diretório.

Os comentários pertencem a histórias publicadas. Após aprovação, aparecem na página da história e, na página inicial, apenas para quem seleciona um ponto a até 250 km da localização aproximada da história. A posição do visitante é comparada no navegador e não é enviada ao servidor para filtrar comentários. Nenhum comentário aparece enquanto o catálogo estiver vazio.

Na área administrativa, ao criar ou editar uma história, clique em **Escolher no mapa** para posicionar o marcador. Um clique muda o local; também é possível arrastar o marcador ou digitar latitude e longitude. Confira se a posição deve ser mostrada publicamente: para histórias sensíveis ou sem endereço confirmado, use um ponto aproximado da região. A seleção não preenche automaticamente cidade, região ou país; esses campos continuam obrigatórios. O mapa do editor só carrega após o clique e requer internet.

Após alterar a página inicial ou os textos em `build_pages.py`, execute `python3 build_pages.py` para atualizar as páginas localizadas. Antes de publicar, revise todas as traduções e substitua os campos pendentes da página de privacidade.
