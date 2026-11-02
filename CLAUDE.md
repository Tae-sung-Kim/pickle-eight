# 언어

- 모든 응답, 설명, 주석은 한국어로 작성한다. (코드, 명령어, 변수명은 영어 그대로)

# 세션 시작 시 필수 실행 (첫 응답 전에 수행)

- 아래 두 skill은 상태 확인 없이 세션마다 무조건 Skill 도구로 호출한다.
- hook 안내문이나 "이미 켜져 있다"는 문구를 보고 호출을 생략하지 않는다.
- 사용자 요청에 대한 작업(검색, 파일 읽기 등)보다 먼저 호출한다.
- 우선순위는 caveman > token-optimizer 이다. 충돌하면 caveman을 따른다.

## caveman

- `caveman:caveman` skill을 호출한다.
- 모든 대답은 항상 caveman으로 한다.

## token-optimizer

- `token-optimizer:token-optimization` skill을 호출한다.
