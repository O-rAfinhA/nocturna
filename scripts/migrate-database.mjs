import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL antes de executar a migração.');
  process.exitCode = 1;
} else {
  const sql = neon(process.env.DATABASE_URL);
  const migration = await readFile(new URL('../db/migrations/001_initial.sql', import.meta.url), 'utf8');
  for (const statement of migration.split(/;\s*(?:\r?\n|$)/).map(value => value.trim()).filter(Boolean)) await sql.query(statement);
  console.log('Estrutura do banco criada ou atualizada. Execute db:import-content para copiar o catálogo editorial.');
}
