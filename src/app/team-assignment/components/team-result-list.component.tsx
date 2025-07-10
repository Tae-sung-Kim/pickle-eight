type TeamResultListPropsType = {
  teams: string[][];
};
export function TeamResultListComponent({ teams }: TeamResultListPropsType) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3 sm:grid-cols-2">
      {teams.map((team, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 rounded-xl shadow-md p-5 flex flex-col items-start"
        >
          <div className="flex items-center mb-2">
            <span className="inline-block bg-indigo-500 text-white rounded-full px-3 py-1 text-xs font-bold mr-2">
              TEAM {idx + 1}
            </span>
            <span className="text-xs text-muted-foreground">
              {team.length}명
            </span>
          </div>
          <ul className="space-y-1 w-full">
            {team.map((member, i) => (
              <li
                key={i}
                className="text-base font-medium text-foreground bg-white/60 rounded px-2 py-1"
              >
                {member}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
export default TeamResultListComponent;
