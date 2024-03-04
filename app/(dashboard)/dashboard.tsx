'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LineChartPeriod from '@/components/ui/line-chart-period';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import Image from 'next/image';
import Filter, { Order, SortBy } from '@/components/ui/filter';
import type { ThemeData } from '../api/dashboard/getThemes';

type DashboardProps = {
  themes: ThemeData[];
};

export default function Dashboard({ themes: themes_ }: DashboardProps) {
  const [themes, setThemes] = useState<ThemeData[]>(themes_);
  const updateFilter = async (
    sortBy: SortBy,
    order: Order,
    filter: string
  ): Promise<void> => {
    const filteredThemes = themes_.filter((theme) =>
      theme.theme.toLowerCase().includes(filter)
    );

    console.log(themes_);

    if (sortBy === 'rating') {
      filteredThemes.sort((a, b) => a.rating - b.rating);
    } else if (sortBy == 'update') {
      filteredThemes.sort(
        (a, b) =>
          a.ratings[a.ratings.length - 1].createdAt.getTime() -
          b.ratings[b.ratings.length - 1].createdAt.getTime()
      );
    }

    if (order === 'desc') {
      filteredThemes.reverse();
    }

    setThemes(filteredThemes);
  };

  return (
    <>
      <Filter updateFilter={updateFilter} />
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
    </>
  );
}
