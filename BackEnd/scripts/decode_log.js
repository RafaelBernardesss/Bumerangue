import fs from 'fs';
import zlib from 'zlib';

const p = 'buildlog.txt';
if (!fs.existsSync(p)) {
  console.error('buildlog.txt não encontrado');
  process.exit(1);
}
const buf = fs.readFileSync(p);

function tryDecode(buf) {
  try {
    const s = buf.toString('utf8');
    if (s.includes('ERROR') || s.includes('Error') || s.includes('BUILD')) {
      console.log('\n=== As UTF-8 text ===\n');
      console.log(s.slice(-4000));
      return true;
    }
  } catch (e) {}
  try {
    const g = zlib.gunzipSync(buf);
    console.log('\n=== gunzip ===\n');
    console.log(g.toString().slice(-4000));
    return true;
  } catch (e) {}
  try {
    const b = zlib.brotliDecompressSync(buf);
    console.log('\n=== brotli ===\n');
    console.log(b.toString().slice(-4000));
    return true;
  } catch (e) {}
  try {
    const i = zlib.inflateSync(buf);
    console.log('\n=== inflate ===\n');
    console.log(i.toString().slice(-4000));
    return true;
  } catch (e) {}
  console.error('Não conseguiu decodificar o log');
  return false;
}

tryDecode(buf);
