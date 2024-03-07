import React from 'react';
import { User } from 'lucia';
import { getThemes, ratingHistory } from '../api/dashboard/getThemes';
import ThemesList from './themes-list';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowBottomRightIcon, ArrowTopRightIcon } from '@radix-ui/react-icons';
import LineChartPeriod from '@/components/ui/line-chart-period';
import Delta from '@/components/ui/delta';

export default async function DashboardWrapper({ user }: { user: User }) {
  const themes = await getThemes(user);
  const { ratings, rating, delta } = await ratingHistory(user);
  return (
    <div className='h-svh flex flex-col items-center pt-12'>
      <div className='flex flex-col max-w-3xl w-full items-stretch gap-8'>
        <div className='space-y-2'>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
            Dashboard
          </h1>
          <p className='text-xl text-muted-foreground text-center'>
            Track your progress over time.
          </p>
        </div>

        <Card>
          <CardContent className='flex items-stretch h-48 gap-4 p-6'>
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
            <div className='flex-1'>
              <LineChartPeriod data={ratings} theme={'overall'} />
            </div>
          </CardContent>
        </Card>

        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
          Themes
        </h1>
        <ThemesList themes={themes} missing={missing} />
      </div>
    </div>
  );
}
