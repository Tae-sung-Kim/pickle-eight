import Link from 'next/link';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { Button } from '@/components/ui/button';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  DREAM_NOT_FOUND_DESCRIPTION,
  DREAM_NOT_FOUND_PRIMARY_LABEL,
  DREAM_NOT_FOUND_SECONDARY_LABEL,
  DREAM_NOT_FOUND_TITLE,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_HUB_PATH } from '@/features/dream/constants/dream-route.constant';

export default function DreamTopicNotFound() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.DREAM}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.DREAM}
          title={DREAM_NOT_FOUND_TITLE}
          description={DREAM_NOT_FOUND_DESCRIPTION}
        />
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-11 w-full bg-menu-dream px-6 font-semibold text-primary-foreground hover:bg-menu-dream/90 sm:w-auto"
          >
            <Link href={DREAM_HUB_PATH} prefetch={false}>
              {DREAM_NOT_FOUND_PRIMARY_LABEL}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
            <Link href="/" prefetch={false}>
              {DREAM_NOT_FOUND_SECONDARY_LABEL}
            </Link>
          </Button>
        </div>
      </div>
    </ContentWrapperComponent>
  );
}
