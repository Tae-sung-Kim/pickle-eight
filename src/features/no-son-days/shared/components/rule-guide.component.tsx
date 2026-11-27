import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { NO_SON_DAYS_GUIDE } from '@/features/no-son-days/constants/no-son-days-guide.constant';

export function NoSonDaysRuleGuideComponent() {
  return (
    <section className="mx-auto mt-10 w-full max-w-2xl text-left">
      <CollapsibleComponent heading={NO_SON_DAYS_GUIDE.heading} level={2}>
        {NO_SON_DAYS_GUIDE.sections.map((section) => (
          <div key={section.id} className="mt-4">
            <h3 className="text-base font-semibold leading-snug">
              {section.title}
            </h3>
            <p className="mt-2 text-base leading-7 text-foreground">
              {section.body}
            </p>
          </div>
        ))}
      </CollapsibleComponent>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {NO_SON_DAYS_GUIDE.source}
      </p>
    </section>
  );
}
