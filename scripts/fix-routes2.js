const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/lotto/user/**/route.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/, \{ status \}\);\s*\}/, '');
  content = content.replace(/\s*export async function GET/, '\n\nexport async function GET');
  content = content.replace(/\s*export async function POST/, '\n\nexport async function POST');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});

let triviaContent = fs.readFileSync('src/app/api/gpt/trivia-quiz/route.ts', 'utf8');
triviaContent = triviaContent.replace(/}\s*catch\s*\(e:\s*any\)\s*\{\s*console\.error\('Trivia quiz failed:', e\.message\);\s*return NextResponse\.json\(\s*\{ error: '문제 생성 실패' \},\s*\{ status: 500 \}\s*\);\s*\}\s*}/, `} catch (e: any) {
      console.error('Trivia quiz failed:', e.message);
      return NextResponse.json(
        { error: '문제 생성 실패' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}`);
fs.writeFileSync('src/app/api/gpt/trivia-quiz/route.ts', triviaContent);
console.log('Fixed trivia quiz route');

