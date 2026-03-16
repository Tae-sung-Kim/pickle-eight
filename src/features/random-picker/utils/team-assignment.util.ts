export const generateTeams = ({
  names,
  teamCount,
  setTeams,
}: {
  names: string[];
  teamCount: number;
  setTeams: (teams: string[][]) => void;
}) => {
  const shuffled = [...names].sort(() => Math.random() - 0.5);
  const base = Math.floor(shuffled.length / teamCount);
  const extra = shuffled.length % teamCount;
  const newTeams: string[][] = [];

  const extraIndexes = Array.from({ length: teamCount }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, extra);

  let idx = 0;
  for (let i = 0; i < teamCount; i++) {
    const size = base + (extraIndexes.includes(i) ? 1 : 0);
    newTeams.push(shuffled.slice(idx, idx + size));
    idx += size;
  }
  setTeams(newTeams);
};
