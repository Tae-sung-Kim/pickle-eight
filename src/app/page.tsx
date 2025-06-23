export default function Home() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 반응형 그리드 예시 */}
        <section className="p-6 rounded-lg border bg-card">
          <div>home1</div>
        </section>
        <section className="p-6 rounded-lg border bg-card">
          <div>home2</div>
        </section>
        <section className="p-6 rounded-lg border bg-card">
          <div>home3</div>
        </section>
      </div>
    </div>
  );
}
