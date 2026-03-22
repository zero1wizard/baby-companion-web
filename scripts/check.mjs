import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const required = ['index.html', 'styles.css', 'app.js', 'README.md', 'package.json'];

for (const file of required) {
  await access(path.join(root, file), constants.R_OK);
}

const appJs = await readFile(path.join(root, 'app.js'), 'utf8');
new vm.Script(appJs, { filename: 'app.js' });

for (const token of ['localStorage', 'memory-form', 'todo-form', 'startSleepSession']) {
  if (!appJs.includes(token)) {
    throw new Error(`Missing app token in app.js: ${token}`);
  }
}

const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const token of ['Sleep', 'Memories', 'Care', 'memory-form', 'todo-form', 'start-session']) {
  if (!html.includes(token)) {
    throw new Error(`Missing section token in index.html: ${token}`);
  }
}

console.log('baby-companion-web check passed');
