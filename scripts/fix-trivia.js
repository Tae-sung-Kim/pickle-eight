const fs = require('fs');

let content = fs.readFileSync('src/app/api/gpt/trivia-quiz/route.ts', 'utf8');

content = content.replace(/  \} catch \(err\) \{ return NextResponse\.json\(\{ error: "Invalid JSON structure" \}, \{ status: 400 \}\); \}\n}\n/, '');
fs.writeFileSync('src/app/api/gpt/trivia-quiz/route.ts', content);
console.log('Fixed trivia-quiz');
