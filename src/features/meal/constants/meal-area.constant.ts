/** 정리한 뒤 허용하는 최대 글자 수 */
export const MEAL_AREA_MAX_LENGTH = 20;

/** 입력란 maxLength. 21자 이상 오류 안내를 보이기 위해 20보다 넉넉하게 둔다 */
export const MEAL_AREA_INPUT_HARD_LIMIT = 100;

/** 허용 문자: 한글 완성형, 영문, 숫자, 공백(U+0020), 가운뎃점(U+00B7), 하이픈(U+002D) */
export const MEAL_AREA_ALLOWED_PATTERN = /^[가-힣A-Za-z0-9 ·-]+$/;

/** 전화번호·상세 번지 입력을 막는 숫자 제한: 연속 숫자 최대 4자, 전체 숫자 최대 6개 */
export const MEAL_AREA_MAX_DIGIT_RUN = 4;
export const MEAL_AREA_MAX_DIGIT_TOTAL = 6;
