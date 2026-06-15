const fs = require('fs');
const path = require('path');

const phoneHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-phone.html';
if (fs.existsSync(phoneHtmlPath)) {
  let content = fs.readFileSync(phoneHtmlPath, 'utf8');
  content = content.replace('}; from server', '};');
  fs.writeFileSync(phoneHtmlPath, content, 'utf8');
  console.log('Successfully fixed syntax error in quiz-phone.html');
} else {
  console.error('quiz-phone.html not found!');
}
