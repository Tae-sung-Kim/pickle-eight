const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/lotto/user/**/route.ts');
console.log('Found files:', files);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace bad function
  content = content.replace(/function bad\([^)]*\)\s*\{[^}]*\}/, '');
  
  // Replace verifyUid function
  content = content.replace(/async function verifyUid\([^)]*\)[^\{]*\{[\s\S]*?catch\s*\{[^}]*\}\s*\}/, '');

  // Add import to top
  const importStatement = "import { bad, verifyUid } from '@/lib/api-utils';\n";
  
  if (!content.includes("from '@/lib/api-utils'")) {
      content = importStatement + content;
  }
  
  // Remove unused adminAuth if it's no longer needed
  if (!content.includes('adminAuth.')) {
      content = content.replace(/adminAuth,\s*/, '');
      content = content.replace(/,\s*adminAuth/, '');
      content = content.replace(/import\s*\{\s*adminAuth\s*\}\s*from\s*'@\/lib\/firebase-admin';\n?/, '');
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
