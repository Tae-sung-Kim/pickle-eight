import { EnglishWordQuizComponent } from './components';

export default function EnglishWordQuizPage() {
  return (
    <div className="flex flex-col items-center w-full bg-gray-50 p-4">
      <div className="w-full max-w-2xl mt-8 mb-20">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          영어 단어 퀴즈
        </h1>
        <p className="text-center text-gray-500 mb-8">
          단어의 뜻을 보고 알맞은 영어 단어를 맞춰보세요!
        </p>
        <EnglishWordQuizComponent />
      </div>
    </div>
  );
}
