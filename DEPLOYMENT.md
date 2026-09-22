# Publicação na Vercel

Esta configuração publica as páginas estáticas em `dist/` e adiciona Functions para catálogo, comentários e administração. O servidor `server.mjs` continua exclusivo para uso local e preserva `data/` no computador.

## Antes do primeiro deploy

1. Crie um banco PostgreSQL no Neon e guarde a URL de conexão em `DATABASE_URL`.
2. No PowerShell, defina temporariamente a variável e execute `npm run db:migrate`. Isso cria as tabelas de histórias, comentários, sessões e limite de tentativas.
3. Ainda com a variável definida, execute `npm run db:import-content`. Esse comando copia o catálogo local para o banco, sem enviar a URL do banco nem as histórias em alterações futuras ao GitHub.
4. Execute `node setup-admin.mjs --vercel`. O comando grava as variáveis administrativas em `data/vercel-admin.env`; adicione os dois valores no painel da Vercel, sem subir o arquivo.
5. No projeto Vercel, configure `DATABASE_URL`, `ADMIN_PASSWORD_SALT` e `ADMIN_PASSWORD_HASH` para Preview e Production.
6. Faça um deploy de Preview e teste login, criação de rascunho, publicação, comentário pendente, aprovação e os três idiomas antes de associar domínio.

Depois de confirmar o catálogo no Preview, remova do índice Git o arquivo local `content/stories.json` e as páginas editoriais geradas. Eles já estão em `.gitignore`, portanto continuarão preservados no computador, mas não serão enviados em commits futuros. O painel passa a gravar exclusivamente no PostgreSQL.

## Rotas e mídia

As rotas de leitura e de localidades geram HTML completo na Function a partir das histórias publicadas no banco. Uma história recém-publicada fica acessível sem esperar outra geração completa. `/sitemap.xml` é atualizado a partir do mesmo catálogo. O deploy não inclui os textos editoriais nem páginas de histórias no repositório.

Guarde imagens, áudios e vídeos em Vercel Blob, S3 ou serviço equivalente. Não envie mídia pesada para o repositório nem para a resposta de uma Function.

## Limites e privacidade

O domínio canônico é `portalnocturna.com.br`. A Vercel confirmou os registros DNS da Hostinger e redireciona `www` para o domínio principal. A versão online usa Vercel Web Analytics sem cookies de análise; as páginas de privacidade descrevem essa medição e informam o responsável e o contato público em PT/EN/ES. A propriedade de domínio completo do Search Console exige um registro TXT na Hostinger; a propriedade HTTPS usa metatag no código e recebeu o sitemap. Google Analytics e AdSense dependem de configuração própria; não inclua IDs de exemplo. A pasta `data/`, os arquivos `.env` e as credenciais administrativas permanecem privados e nunca devem ser enviados ao repositório.
