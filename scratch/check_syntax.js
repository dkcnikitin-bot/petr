const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlFiles = [
  'public/quiz-phone.html',
  'public/quiz-admin.html',
  'public/quiz-screen.html',
  'public/hostess.html',
  'public/organizer.html',
  'public/herald.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  console.log(`Checking ${file}...`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all <script> blocks (excluding those with src)
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let blockIndex = 1;
  
  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptCode = match[1].trim();
    // Skip external scripts
    if (match[0].includes('src=')) {
      continue;
    }
    
    if (!scriptCode) continue;
    
    try {
      new vm.Script(scriptCode);
      console.log(`  Block #${blockIndex}: OK`);
    } catch (err) {
      console.error(`  Error in Block #${blockIndex}:`);
      console.error(err);
      process.exit(1);
    }
    blockIndex++;
  }
});

console.log('All script syntax checks passed successfully!');
