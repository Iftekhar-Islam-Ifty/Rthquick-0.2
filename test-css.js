const fs = require('fs');
const css = fs.readFileSync('css/style.css', 'utf8');

let openBraces = 0;
let lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let c of line) {
    if (c === '{') openBraces++;
    if (c === '}') openBraces--;
    if (openBraces < 0) {
      console.log(`Extra closing brace at line ${i + 1}: ${line}`);
      openBraces = 0;
    }
  }
}
console.log(`Final unclosed braces: ${openBraces}`);
