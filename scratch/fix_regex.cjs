const fs = require('fs');
const path = require('path');
const dir = 'src/components/resume/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\\\*\*.*?\*\\\*/g, '\\*\\*.*?\\*\\*'); // wait this is wrong
  // Instead of regex replace, just string replace:
  content = content.split('(/(\\**.*?\\**|__.*?__)/g)').join('(/(\\**.*?\\**|__.*?__)/g)'); // wait, the original string is "(/(\\**.*?\\**|__.*?__)/g)"
  // The original has: (/(\**.*?\**|__.*?__)/g)
  content = content.split('(/(\\**.*?\\**|__.*?__)/g)').join('(/(\\*\\*.*?\\*\\*|__.*?__)/g)');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed regex in ' + file);
}
