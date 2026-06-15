const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'diplom', 'temps');
const files = fs.readdirSync(dir);

console.log('--- Files in diplom/temps ---');
files.forEach(f => {
  const hex = Buffer.from(f).toString('hex');
  const codes = [];
  for (let i = 0; i < f.length; i++) {
    codes.push(f.charCodeAt(i).toString(16).padStart(4, '0'));
  }
  console.log(`${f} -> hex: ${hex} -> unicode: ${codes.join(' ')}`);
});
