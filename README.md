# Nocturna

Atlas interativo de histórias incomuns, em português, inglês e espanhol. O catálogo publicado fica no PostgreSQL da versão online; a cópia editorial local em `content/stories.json` e os dados em `data/` permanecem fora do GitHub. Na versão online, o Vercel Web Analytics só carrega após a escolha do visitante no aviso de privacidade, em PT/EN/ES. A preferência é salva no armazenamento local e pode ser alterada pelo botão no rodapé. Google Analytics e anúncios não estão ativos.

Se você abrir este projeto com outro Codex, leia `AGENTS.md` e `CONTEXTO-PARA-CODEX.md` para conhecer as decisões anteriores e preservar dados transferidos do computador antigo.

Para configurar ou atualizar a publicação na Vercel, siga [DEPLOYMENT.md](DEPLOYMENT.md). O servidor local continua disponível para desenvolvimento sem banco remoto.

As páginas ficam em `/pt/`, `/en/` e `/es/`, com páginas de privacidade correspondentes. Histórias publicadas ganham páginas individuais e páginas por localidade, como `/pt/locais/curitiba-parana-brasil/`, `/en/places/curitiba-parana-brasil/` e `/es/lugares/curitiba-parana-brasil/`. Na Vercel, o HTML das histórias e localidades é gerado a partir do banco, com URLs canônicas, alternância de idiomas e `/sitemap.xml` dinâmico. As páginas de privacidade também têm URLs canônicas e aparecem no sitemap.

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
- `dist/app.js`: globo, seleção, busca, catálogo público carregado da API e traduções.
- `build_pages.py`: gera páginas estáticas dos três idiomas, páginas de histórias publicadas e páginas por localidade.
- `content/story.schema.json`: campos e classificações das histórias.
- `content/stories.json`: cópia editorial local, fora do GitHub. Apenas registros com `status: "published"` são públicos; registros publicados exigem texto nos três idiomas e fontes para casos classificados como documentados.
- `server.mjs`: servidor local, autenticação do administrador e APIs de histórias e comentários.
- `local-store.mjs`: armazenamento local dos comentários e sessões, sem dependências externas.
- `setup-admin.mjs`: cadastro local da senha do administrador.
- `dist/admin/`: interface de publicação e moderação.

O globo solicita os contornos publicados no pacote `world-atlas` pela CDN jsDelivr. Os nomes dos países usam os códigos ISO em `dist/country-codes.json` e `Intl.DisplayNames` para PT/EN/ES; aparecem conforme o zoom e o espaço disponível, evitando colisões com marcadores. Se a rede não permitir os contornos, o globo continua com grade, marcadores e seleção. A aba **Mapa detalhado** carrega a biblioteca Leaflet 1.9.4 pela jsDelivr e os blocos da região exibida do OpenStreetMap somente após o visitante clicar nela. Permite ampliar até o nível das ruas e escolher qualquer ponto com um clique, usando as coordenadas para ordenar histórias e filtrar comentários da região. Cada história editorial publicada aparece como um ponto vermelho no mapa: clique no ponto para abrir o título e o link da história no idioma atual. Rascunhos e histórias em revisão não aparecem. Enquanto não houver histórias publicadas, nenhum desses pontos será exibido. O globo permanece acessível se a conexão do mapa falhar. A marcação mostra cinco casas decimais no modo mapa, mas o mapa não aumenta a precisão real da localização concedida pelo dispositivo.

Ao enviar uma busca de cidade ou código postal fora dos exemplos, o navegador consulta a [API de geocodificação Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), baseada nos dados [GeoNames](https://www.geonames.org/export/). A busca retorna opções quando há mais de um lugar com o mesmo nome; escolha uma para mover o globo ou mapa e ordenar as histórias. Nada é enviado durante a digitação. Se a busca externa falhar, as seis cidades de exemplo e a seleção no globo ou mapa continuam disponíveis. Esta integração gratuita é somente para o protótipo local sem publicidade: os [termos da Open-Meteo](https://open-meteo.com/en/terms) consideram sites com anúncios uso comercial, que requer um serviço ou plano comercial antes da publicação monetizada. Atribuição aos fornecedores aparece no rodapé.

O zoom funciona pelos botões `+` e `−` ou pela roda do mouse enquanto o cursor está sobre o globo ou o mapa. Fora dessa área, a página rola normalmente. O mapa requer conexão com a internet. Os blocos do OpenStreetMap têm atribuição visível e recebem solicitações apenas da área exibida; o fornecedor pode inferir a região visualizada a partir dos blocos. Antes de publicar o site com AdSense e tráfego real, configure um provedor de blocos apropriado para produção e revise os termos de uso, limites, atribuição e aviso de privacidade. O servidor comunitário do OpenStreetMap não oferece garantia de disponibilidade.

## Próximas etapas

Os textos de privacidade identificam o responsável e o e-mail público de contato. O aviso atual controla apenas a medição da Vercel; não é uma CMP para anúncios nem controla as conexões necessárias ao globo ou os serviços abertos por ação do visitante. A propriedade HTTPS do Search Console é verificada por metatag na página inicial e o sitemap foi enviado; a propriedade de domínio completo exige um registro TXT na Hostinger. Google Analytics pode ser configurado quando houver um ID de medição e os controles de privacidade correspondentes. O `ads.txt` oficial do AdSense está publicado e a revisão do site foi solicitada; anúncios ainda não estão ativos. Antes de exibi-los, revise as condições dos serviços de mapa e busca e configure uma CMP apropriada. O código gera HTML de leitura e sitemap para o conteúdo publicado.

Quando uma história é publicada, sua localidade aparece no diretório da página inicial; histórias da mesma cidade, região e país são reunidas. Rascunhos e casos em revisão não geram páginas públicas. Na Vercel, as mudanças no catálogo aparecem diretamente nas rotas e no sitemap, sem novo deploy.

Os comentários pertencem a histórias publicadas. Após aprovação, aparecem na página da história e, na página inicial, apenas para quem seleciona um ponto a até 250 km da localização aproximada da história. A posição do visitante é comparada no navegador e não é enviada ao servidor para filtrar comentários. Nenhum comentário aparece enquanto o catálogo estiver vazio.

Na área administrativa, ao criar ou editar uma história, clique em **Escolher no mapa** para posicionar o marcador. Um clique muda o local; também é possível arrastar o marcador ou digitar latitude e longitude. Confira se a posição deve ser mostrada publicamente: para histórias sensíveis ou sem endereço confirmado, use um ponto aproximado da região. A seleção não preenche automaticamente cidade, região ou país; esses campos continuam obrigatórios. O mapa do editor só carrega após o clique e requer internet.

Após alterar a página inicial ou os textos em `build_pages.py`, execute `python3 build_pages.py` para atualizar as páginas localizadas. Antes de publicar, revise todas as traduções e os textos da página de privacidade.
