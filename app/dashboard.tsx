import React from 'react';
import LineChartPeriod from '@/components/ui/line-chart-period';
import { getThemes } from './api/dashboard/getThemes';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import Image from 'next/image';
import { User } from 'lucia';

export default async function Dashboard({ user }: { user: User }) {
  const themes = await getThemes(user);
  return (
    <div className='h-svh flex flex-col items-center pt-12'>
      <div className='flex flex-col max-w-3xl w-full items-stretch gap-8'>
        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
          Dashboard
        </h1>
        <p className='text-xl text-muted-foreground text-center'>
          Track your progress over time.
        </p>

        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
          Themes
        </h1>
        {themes.map(({ theme, ratings, rating, nb }) => (
          <Card key={theme}>
            <CardContent className='flex items-stretch h-48 gap-4 p-6'>
              <div className='flex justify-center items-center'>
                <div className='w-20 aspect-square relative'>
                  <Image
                    src={`https://lichess1.org/assets/_SQ9ycq/images/puzzle-themes/${theme}.svg`}
                    fill
                    className='object-cover'
                    alt={theme}
                  />
                </div>
              </div>
              <div className='flex flex-col items-center justify-center text-center w-48'>
                <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
                  {capitalize(theme)}
                </h3>
                <p className='text-xl text-muted-foreground'>
                  {Math.round(rating)}
                </p>
              </div>
              <div className='flex-1'>
                <LineChartPeriod data={ratings} theme={theme} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
