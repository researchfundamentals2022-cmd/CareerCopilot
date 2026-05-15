const fs = require('fs');
const path = require('path');
const dir = 'src/components/resume/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const parseFunc = `
const parseFormattedText = (text) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\\**.*?\\**|__.*?__)/g);
  return parts.map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};
`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove bold stripping
  content = content.replace(/\s*\.replace\(\/\\\*\\\*\(\.\*\?\)\\\*\\\*\/g, "\$1"\)/g, '');
  content = content.replace(/\s*\.replace\(\/__\(\.\*\?\)__\/g, "\$1"\)/g, '');

  // 2. Add parseFormattedText if not exists
  if (!content.includes('parseFormattedText')) {
    content = content.replace(/(const cleanInlineText = )/, parseFunc + '\n$1');
  }

  // 3. Update BulletBlock
  content = content.replace(/>\s*\{bullet\}\s*<\/li>/g, '>{parseFormattedText(bullet)}</li>');
  
  // 4. Update Paragraph Block or raw paragraph
  content = content.replace(/>\s*\{text\}\s*<\/p>/g, '>{parseFormattedText(text)}</p>');
  content = content.replace(/>\s*\{paragraph\}\s*<\/p>/g, '>{parseFormattedText(paragraph)}</p>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
