import React from 'react';
import { User } from 'lucia';
import { getThemes, ratingHistory } from '../api/dashboard/getThemes';
import ThemesList from './themes-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LineChartPeriod from '@/components/ui/line-chart-period';
import Delta from '@/components/ui/delta';
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area';
import { getRecentGroups } from '../api/dashboard/recentGroups';
import { capitalize, toGroup } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardWrapper({ user }: { user: User }) {
  const [themes, missing] = await getThemes(user);
  const { ratings, rating, delta } = await ratingHistory(user);
  const groups = await getRecentGroups(user.username);
  return (
    <div className='min-h-svh flex flex-col items-center py-12 px-2'>
      <div className='flex flex-col max-w-5xl w-full items-stretch gap-8'>
        <div className='space-y-2'>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
            Dashboard
          </h1>
          <p className='text-xl text-muted-foreground text-center'>
            Track your progress over time.
          </p>
        </div>
        <Card>
          <CardContent className='flex flex-col md:flex-row items-center md:items-stretch h-96 md:h-48 gap-4 p-6'>
            <div className='flex flex-col items-center justify-center text-center w-48 gap-4'>
              <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
                Overall Rating
              </h3>
              <div className='flex gap-8 font-bold text-left'>
                <div>
                  <p className='text-xs text-muted-foreground tracking-tighter'>
                    Rating
                  </p>
                  <p className='text-xl'>{Math.round(rating) || 1500}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground tracking-tighter'>
                    Delta
                  </p>
                  <Delta delta={delta} />
                </div>
              </div>
            </div>
            <div className='flex-1 w-full'>
              <LineChartPeriod data={ratings} theme={'overall'} />
            </div>
          </CardContent>
        </Card>

        {groups.length > 0 && (
          <div>
            <p className='font-bold mb-2 tracking-tighest text-secondary-foreground'>
              Your recent groups
            </p>
            <div>
              <ScrollArea className='whitespace-nowrap rounded-md border'>
                <div className='flex w-max space-x-4 p-4'>
                  {groups.map((group) => {
                    const themes = toGroup(group.groupId);
                    return (
                      <Link
                        key={group.groupId}
                        href={`puzzle/group/${group.groupId}`}
                      >
                        <Card className='max-w-64 hover:bg-muted/30'>
                          <CardContent className='p-2'>
                            <p className='text-xs font-bold tracking-tighter text-center pb-1'>
                              {themes.length} themes(s)
                            </p>
                            <div className='flex gap-1 w-100 overflow-hidden'>
                              {themes.map((theme) => {
                                return (
                                  <Badge key={theme} variant={'outline'}>
                                    {capitalize(theme).toLowerCase()}
                                  </Badge>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          </div>
        )}

        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
          Themes
        </h1>
        <ThemesList themes={themes} missing={missing} />
      </div>
    </div>
  );
}
