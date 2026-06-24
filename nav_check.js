try {
  const fs = require('fs');
  const code = fs.readFileSync('D:\\健身网站\\public\\js\\nav.js', 'utf-8');
  new Function(code);
  console.log('SYNTAX OK');
} catch(e) {
  console.log('SYNTAX ERROR:', e.message);
}
