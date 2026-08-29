const fs = require('fs');
const z = require('zlib');
const p = process.argv[2] || 'buildlog.txt';
if (!fs.existsSync(p)) { console.error(`${p} não encontrado`); process.exit(1); }
const buf = fs.readFileSync(p);
function print(s) { console.log('\n----- OUTPUT -----\n'); console.log(s.slice(-4000)); }
try { print(buf.toString('utf8')); process.exit(0); } catch(e) {}
try { const g = z.gunzipSync(buf); print(g.toString('utf8')); process.exit(0); } catch(e) {}
try { const b = z.brotliDecompressSync(buf); print(b.toString('utf8')); process.exit(0);} catch(e) {}
try { const i = z.inflateSync(buf); print(i.toString('utf8')); process.exit(0);} catch(e) {}
console.error('Não foi possível decodificar o buildlog');
process.exit(1);
