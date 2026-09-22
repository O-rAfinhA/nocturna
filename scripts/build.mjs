import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'py' : 'python3';
const args = process.platform === 'win32' ? ['-3', 'build_pages.py'] : ['build_pages.py'];
const child = spawn(command, args, { stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code || 0; });
