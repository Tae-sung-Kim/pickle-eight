// 메이저 0~10번 상징 도형. 자체 제작(원·선·호·다각형만 사용).
// 상징 영역: 140 x 140, 중심 (100, 172), viewBox 200 x 340.
// 부모(TarotMajorSymbolComponent)가 <g>로 감싸 fill none, stroke currentColor, 선 3, round를 준다.

export type TarotMajorSymbol0To10ComponentPropsType = {
  rank: number;
};

// 0번(바보)과 21번(세계)이 함께 쓰는 "시작점의 작은 빈 원"
export const TAROT_START_CIRCLE = { cx: 60, cy: 222, r: 6 } as const;

// 점선 표현: 길이 1의 점을 둥근 끝으로 찍어 점으로 보이게 한다
export const TAROT_DOTTED_DASH = '1 8';

export function TarotMajorSymbol0To10Component({
  rank,
}: TarotMajorSymbol0To10ComponentPropsType) {
  switch (rank) {
    case 0:
      // 바보: 작은 빈 원에서 출발해 영역 밖으로 빠져나가는 점선 곡선
      return (
        <>
          <path
            d="M66 218 C 96 206, 62 158, 104 140 S 150 110, 172 98"
            strokeDasharray={TAROT_DOTTED_DASH}
          />
          <circle {...TAROT_START_CIRCLE} fill="var(--card)" />
        </>
      );
    case 1:
      // 마법사: 가운데 채운 점, 네 방향에서 점을 향하는 짧은 화살선 4개
      return (
        <>
          <circle cx={100} cy={172} r={7} fill="currentColor" stroke="none" />
          {[0, 90, 180, 270].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 100 172)`}>
              <line x1={100} y1={110} x2={100} y2={152} />
              <path d="M93 143 L100 152 L107 143" />
            </g>
          ))}
        </>
      );
    case 2:
      // 여사제: 큰 원 안의 작은 원(아래로 치우침), 아래에 물결선 한 줄
      return (
        <>
          <circle cx={100} cy={160} r={52} />
          <circle cx={100} cy={185} r={20} />
          <path d="M44 230 q 14 -10 28 0 t 28 0 t 28 0 t 28 0" />
        </>
      );
    case 3:
      // 여황제: 겹친 같은 크기의 원 3개(삼각 배치), 겹친 가운데에 채운 점
      return (
        <>
          <circle cx={100} cy={152} r={36} />
          <circle cx={80} cy={187} r={36} />
          <circle cx={120} cy={187} r={36} />
          <circle cx={100} cy={175} r={5} fill="currentColor" stroke="none" />
        </>
      );
    case 4:
      // 황제: 정사각형 안에 45도 돌린 정사각형, 가운데 십자 보조선
      return (
        <>
          <rect x={48} y={120} width={104} height={104} />
          <rect
            x={72}
            y={144}
            width={56}
            height={56}
            transform="rotate(45 100 172)"
          />
          <path
            d="M100 132 V212 M60 172 H140"
            strokeWidth={1.5}
            opacity={0.4}
          />
        </>
      );
    case 5:
      // 교황: 위로 갈수록 짧아지는 가로선 3단, 맨 위에 작은 원
      return (
        <>
          <line x1={50} y1={222} x2={150} y2={222} />
          <line x1={65} y1={198} x2={135} y2={198} />
          <line x1={80} y1={174} x2={120} y2={174} />
          <circle cx={100} cy={146} r={9} fill="var(--card)" />
        </>
      );
    case 6:
      // 연인: 겹친 두 원, 교집합 부분만 사선 해칭
      return (
        <>
          <circle cx={78} cy={172} r={36} />
          <circle cx={122} cy={172} r={36} />
          <path
            d="M90.6 154.4 L100.8 144.2 M86.3 167.7 L105.3 148.7 M86.3 176.7 L109.1 153.9 M88 184 L111.9 160.1 M90.9 190.1 L113.6 167.4 M94.6 195.4 L113.7 176.3 M99.2 199.8 L109.4 189.6"
            strokeWidth={1.5}
          />
        </>
      );
    case 7:
      // 전차: 같은 방향(위)을 향한 꺾쇠 3개, 앞쪽일수록 진하게(0.4 -> 1)
      return (
        <>
          <path d="M66 216 L100 188 L134 216" opacity={0.4} />
          <path d="M66 186 L100 158 L134 186" opacity={0.7} />
          <path d="M66 156 L100 128 L134 156" />
        </>
      );
    case 8:
      // 힘: 안에서 밖으로 풀리는 나선 하나
      return (
        <path d="M102 172 L102.9 172.8 L103.5 174 L103.6 175.6 L103.1 177.3 L101.9 178.9 L100 180.2 L97.6 180.9 L94.9 180.9 L92 180 L89.3 178.2 L87.1 175.5 L85.6 172 L85.1 168 L85.7 163.8 L87.6 159.6 L90.7 155.9 L94.9 153.1 L100 151.4 L105.6 151.1 L111.3 152.4 L116.8 155.2 L121.4 159.6 L124.9 165.3 L126.8 172 L126.9 179.2 L125 186.4 L121.1 193.1 L115.5 198.8 L108.3 202.9 L100 205 L91.2 204.9 L82.5 202.4 L74.5 197.5 L67.8 190.6 L63.1 181.9 L60.8 172 L61.1 161.6 L64.3 151.4 L70.1 142.1 L78.3 134.5 L88.5 129.1 L100 126.6 L112 127.1 L123.7 130.9 L134.3 137.7 L142.9 147.2 L148.8 158.9 L151.6 172 L150.8 185.6 L146.5 198.8 L138.7 210.7 L127.9 220.3 L114.7 226.8 L100 229.8 L84.8 228.8 L70.1 223.8 L56.9 215.1 L46.4 203 L39.2 188.3 L36 172" />
      );
    case 9:
      // 은둔자: 넓은 빈 공간 아래쪽에 채운 점, 그 둘레에 점선 원 두 겹
      return (
        <>
          <circle cx={100} cy={204} r={6} fill="currentColor" stroke="none" />
          <circle
            cx={100}
            cy={204}
            r={18}
            strokeDasharray={TAROT_DOTTED_DASH}
          />
          <circle
            cx={100}
            cy={204}
            r={34}
            strokeDasharray={TAROT_DOTTED_DASH}
          />
        </>
      );
    case 10:
      // 운명의 수레바퀴: 같은 방향(시계)으로 도는 호 화살표 3개가 원을 이룸
      return (
        <>
          {[0, 120, 240].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 100 172)`}>
              <path d="M90.3 116.9 A56 56 0 0 1 152.6 152.9" />
              <path d="M155.8 141.1 L152.6 152.9 L142.6 145.8" />
            </g>
          ))}
        </>
      );
    default:
      return null;
  }
}
