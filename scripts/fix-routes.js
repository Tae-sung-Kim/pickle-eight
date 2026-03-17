const fs = require('fs');
const glob = require('glob');

// Fix trivia-quiz route
let triviaContent = fs.readFileSync('src/app/api/gpt/trivia-quiz/route.ts', 'utf8');
if (triviaContent.endsWith('}\n}\n')) {
    // Looks okay but let's just make sure the catch is there
} else if (triviaContent.endsWith('}\n')) {
    triviaContent += '  } catch (err) { return NextResponse.json({ error: "Invalid JSON structure" }, { status: 400 }); }\n}\n';
    fs.writeFileSync('src/app/api/gpt/trivia-quiz/route.ts', triviaContent);
} else {
    triviaContent += '}\n';
    fs.writeFileSync('src/app/api/gpt/trivia-quiz/route.ts', triviaContent);
}

// Fix lotto routes
const files = glob.sync('src/app/api/lotto/user/**/route.ts');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove rogue code block that got left behind
    content = content.replace(/export async function GET\(req: NextRequest\) \{\s*const uid = await verifyUid\(req\);\s*if \(!uid\) return bad\(401, 'auth\/missing_or_invalid'\);\s*try \{\s*const snap = await adminDb/g, 'export async function GET(req: NextRequest) {\n  const uid = await verifyUid(req);\n  if (!uid) return bad(401, \'auth/missing_or_invalid\');\n  try {\n    const snap = await adminDb');
    
    // Specifically fix syntax errors at line 6 or 9
    // Basically, my previous script deleted `adminAuth` block but might have messed up `export async function GET`
    // Let's just fix it manually using regex
    
    fs.writeFileSync(file, content);
});
