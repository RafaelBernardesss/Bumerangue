const fs = require('fs');
const path = process.argv[2] || 'buildlog.txt';
if (!fs.existsSync(path)) { console.error('arquivo não encontrado:', path); process.exit(1); }
const buf = fs.readFileSync(path);
let res = '';
let cur = '';
for (let i=0;i<buf.length;i++){
  const c = buf[i];
  if (c>=32 && c<=126){ // printable ASCII
    cur += String.fromCharCode(c);
  } else {
    if (cur.length>=4) res += cur + '\n';
    cur = '';
  }
}
if (cur.length>=4) res += cur + '\n';
if (!res) console.error('nenhuma string ASCII longa encontrada'); else console.log(res.slice(-8000));
