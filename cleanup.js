const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'hostess.html');
let content = fs.readFileSync(file, 'utf8');

// Remove styles
content = content.replace(/<style>\s*\/\* Кастомные стили для вкладки дипломов \*\/[\s\S]*?<\/style>/, '');

// Remove button
content = content.replace(/\s*<button class="main-tab-btn" id="tab-btn-diplomas">ДИПЛОМЫ \(PDF\)<\/button>/, '');

// Remove panel-diplomas HTML block
content = content.replace(/\s*<!-- Вкладка 3: Дипломы \(PDF\) -->[\s\S]*?<!-- Футер -->/, '\n    <!-- Футер -->');

// Remove JS variable declarations
content = content.replace(/\s*const tabDiplomasBtn = document\.getElementById\('tab-btn-diplomas'\);/, '');
content = content.replace(/\s*const panelDiplomas = document\.getElementById\('panel-diplomas'\);/, '');

// Remove JS tab state resets
content = content.replace(/\s*tabDiplomasBtn\.classList\.remove\('active'\);/g, '');
content = content.replace(/\s*panelDiplomas\.style\.display = 'none';/g, '');

// Remove tabDiplomasBtn click listener
content = content.replace(/\s*tabDiplomasBtn\.addEventListener\('click', \(\) => {[\s\S]*?}\);/, '');

// Remove diplomas logic at the end (from TEMPLATE_PATHS to the end of script)
content = content.replace(/\s*const TEMPLATE_PATHS = {[\s\S]*?<\/script>/, '\n  </script>');

// Save
fs.writeFileSync(file, content, 'utf8');
console.log('Cleanup complete');
