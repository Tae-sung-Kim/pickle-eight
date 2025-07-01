import { Users } from 'lucide-react';

export function DrawOrderGuideComponent() {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary" />
          참가자 안내
        </h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-3 bg-blue-50/50 backdrop-blur-sm rounded-lg">
            <p className="font-medium text-blue-800">💡 사용 방법</p>
            <ol className="mt-1 space-y-1 list-decimal list-inside">
              <li>
                참가자 동그라미를 클릭하면, 동그라미가 회전한 뒤 결과가
                공개됩니다.
              </li>
              <li>
                결과는 자동으로 기록되며, 한 번 공개된 결과는 다시 볼 수
                있습니다.
              </li>
              <li>
                모든 참가자가 추첨을 마치면 전체 결과를 확인할 수 있습니다.
              </li>
            </ol>
          </div>
          <div className="p-3 bg-amber-50/50 backdrop-blur-sm rounded-lg">
            <p className="font-medium text-amber-800">ℹ️ 참고 사항</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>
                동그라미 클릭 시 결과는 회전 애니메이션이 끝난 후에만
                나타납니다.
              </li>
              <li>진행 중에는 다른 참가자를 동시에 클릭할 수 없습니다.</li>
              <li>다시 시작하려면 &apos;다시 하기&apos; 버튼을 클릭하세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
