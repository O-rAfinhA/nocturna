import { randomBytes, scryptSync } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function secret(question) {
  return new Promise((resolveAnswer, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) return reject(new Error('Execute em um terminal interativo.'));
    let value = '';
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const onData = char => {
      if (char === '\u0003') { process.stdin.setRawMode(false); process.exit(130); }
      if (char === '\r' || char === '\n') { process.stdin.off('data', onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); resolveAnswer(value); }
      else if (char === '\u007f' || char === '\b') { if (value) { value = value.slice(0, -1); process.stdout.write('\b \b'); } }
      else if (char.length === 1 && char >= ' ') { value += char; process.stdout.write('*'); }
    };
    process.stdin.on('data', onData);
  });
}

try {
  const password = await secret('Crie uma senha de administrador (mínimo 12 caracteres): ');
  const confirmation = await secret('Repita a senha: ');
  if (password.length < 12 || password !== confirmation) throw new Error('As senhas não coincidem ou têm menos de 12 caracteres.');
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  const data = resolve('data');
  await mkdir(data, { recursive: true });
  if (process.argv.includes('--vercel')) {
    await writeFile(resolve(data, 'vercel-admin.env'), `ADMIN_PASSWORD_SALT=${salt.toString('hex')}\nADMIN_PASSWORD_HASH=${hash.toString('hex')}\n`, { mode: 0o600 });
    console.log('Credenciais para a Vercel gravadas em data/vercel-admin.env. Configure-as como variáveis de ambiente e mantenha o arquivo privado.');
  } else {
    await writeFile(resolve(data, 'admin.json'), JSON.stringify({salt:salt.toString('hex'),hash:hash.toString('hex')}), {mode:0o600});
    console.log('Senha cadastrada. Você já pode iniciar o servidor.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
