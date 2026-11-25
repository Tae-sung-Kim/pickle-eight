import { NO_SON_DAYS_GUIDE } from '@/features/no-son-days/constants/no-son-days-guide.constant';

export function NoSonDaysRuleGuideComponent() {
  return (
    <section className="mx-auto mt-10 w-full max-w-2xl text-left">
      <h2 className="text-xl font-bold leading-snug">
        {NO_SON_DAYS_GUIDE.heading}
      </h2>
      {NO_SON_DAYS_GUIDE.sections.map((section) => (
        <div key={section.id} className="mt-6">
          <h3 className="text-base font-semibold leading-snug">
            {section.title}
          </h3>
          <p className="mt-2 text-base leading-7 text-foreground">
            {section.body}
          </p>
        </div>
      ))}
    </section>
  );
}
