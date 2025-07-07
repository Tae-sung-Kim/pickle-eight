'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type HomeIntroCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

/**
 * HomeIntroCard for displaying info on main home page.
 */
export function HomeIntroCard({
  title,
  description,
  icon,
}: HomeIntroCardProps) {
  return (
    <Card className="h-full shadow-md hover:shadow-xl transition">
      <CardHeader className="flex flex-row items-center gap-2">
        {icon}
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
