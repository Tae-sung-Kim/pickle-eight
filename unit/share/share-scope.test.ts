import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const FILES = walk(SRC).map((p) => ({
  rel: relative(ROOT, p).replaceAll('\\', '/'),
  text: readFileSync(p, 'utf8'),
}));

const withText = (re: RegExp) =>
  FILES.filter((f) => re.test(f.text)).map((f) => f.rel);

const CARD_FILES = FILES.filter((f) =>
  /(^|\/)(compatibility-|fortune-|tarot-)?share-card\.component\.tsx$/.test(
    f.rel
  )
);

describe('AC-10, 15: 공유 범위', () => {
  it('공유 import는 1~2차 대상 기능에만 있다', () => {
    const users = withText(
      /@\/components\/share\/|@\/hooks\/use-share\.hook|@\/lib\/share(-capture|-env)?['"]/
    ).filter(
      (p) => !/^src\/(components\/share|lib\/share|hooks\/use-share)/.test(p)
    );
    expect(users.length).toBeGreaterThan(0);
    for (const p of users) {
      expect(p).toMatch(
        /^src\/features\/(meal|lucky-draw|fortune|lotto\/generator)\/|^src\/features\/tarot\/shared\/components\/tarot-share\.component\.tsx$|^src\/features\/lotto\/(utils|constants)\/lotto-share\.|^src\/hooks\/use-capture\.hook\.ts$/
      );
    }
  });

  it('사주, 꿈 해몽, 타로, 로또 생성기 외 로또 화면에는 공유 import가 없다', () => {
    const users = withText(
      /@\/components\/share\/|@\/hooks\/use-share\.hook|@\/lib\/share/
    );
    for (const p of users) {
      expect(p).not.toMatch(
        /^src\/features\/(dream|tarot\/(?!shared\/components\/tarot-share\.component\.tsx$)|lotto\/(?!generator\/|(utils|constants)\/lotto-share\.)|lunch)\/|compatibility\/saju|fortune\/saju/
      );
    }
  });

  it('html-to-image import는 share-capture.ts와 use-capture.hook.ts뿐', () => {
    expect(withText(/from ['"]html-to-image['"]/).sort()).toEqual([
      'src/hooks/use-capture.hook.ts',
      'src/lib/share-capture.ts',
    ]);
  });

  it('공용 share 파일에 console.이 없다', () => {
    const shared = FILES.filter((f) =>
      /^src\/(components\/share\/|lib\/share|hooks\/use-share|hooks\/use-capture|constants\/share|types\/share)/.test(
        f.rel
      )
    );
    expect(shared.length).toBeGreaterThan(5);
    for (const f of shared) expect(f.text, f.rel).not.toMatch(/console\./);
  });

  it('1080, 1350, 540, 675는 share.constant.ts 밖 share 파일에 없다', () => {
    const shared = FILES.filter(
      (f) => /share/.test(f.rel) && f.rel !== 'src/constants/share.constant.ts'
    );
    for (const f of shared)
      expect(f.text, f.rel).not.toMatch(/\b(1080|1350|540|675)\b/);
  });
});

describe('share-tarot AC-6: 타로 공유 버튼은 두 결과 화면에만 붙는다', () => {
  it('TarotShareComponent 사용처는 /tarot/daily, /tarot/three-card 루트뿐', () => {
    const users = withText(/<TarotShareComponent\b/).sort();
    expect(users).toEqual([
      'src/features/tarot/daily/components/root.component.tsx',
      'src/features/tarot/three-card/components/root.component.tsx',
    ]);
  });
});

describe('AC-16: 카드 DOM에 상호작용 요소가 없다', () => {
  it('카드 파일 8개를 찾는다', () => {
    expect(CARD_FILES).toHaveLength(8);
  });

  it.each(CARD_FILES.map((f) => [f.rel, f.text] as const))(
    '%s',
    (_rel, text) => {
      const hasIgnore = text.includes('data-capture="ignore"');
      for (const re of [
        /<button/,
        /<input/,
        /<textarea/,
        /<a[\s>]/,
        /<Button\b/,
        /@\/features\/ad/,
      ]) {
        if (re.test(text)) expect(hasIgnore).toBe(true);
      }
      expect(text).not.toMatch(/<h[1-6][\s>]/);
      expect(text).not.toMatch(/<img[\s>]/);
      expect(text).not.toMatch(/<Image\b/);
    }
  );
});
