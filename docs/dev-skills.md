# 개발 도구 스킬·플러그인 설치

앱 코드와 무관한 개발 도구다. 스킬 파일은 용량이 커서 git에 올리지 않는다(`.gitignore`에 `.claude/skills/`, `.agents/`, `skills-lock.json`). 새 PC에서는 아래를 다시 실행한다. 사용 시점은 [CLAUDE.md](../CLAUDE.md)의 "스킬·플러그인 사용 시점"을 따른다.

## 스킬 (프로젝트 설치)

`--global`은 붙이지 않는다. 붙이면 `~/.agents/skills/`에 깔려 Claude Code가 읽지 못한다. `npx`는 hook이 막으므로 `pnpm dlx`를 쓴다.

```bash
# grill-me는 grilling을 호출하므로 둘 다 설치한다
pnpm dlx skills@latest add mattpocock/skills --skill grill-me --skill grilling --agent claude-code --copy --yes

# archify (archify-pr은 선택)
pnpm dlx skills@latest add https://archify.si --skill archify --skill archify-pr --agent claude-code --copy --yes
```

- grill-me는 사용자 전용이다. 직접 `/grill-me`를 입력해야 한다. 모델이 자동으로 부르는 쪽은 `grilling`이다.
- 설치 직후 스킬이 안 보이면 Claude Code를 재시작한다.

## 플러그인 (사용자 전역)

`/plugin`에서 마켓플레이스를 추가해 설치한다. 설정은 `~/.claude/settings.json`에 있다.

| 플러그인 | 마켓플레이스 저장소 |
|---|---|
| `ponytail` | `DietrichGebert/ponytail` |
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` |
