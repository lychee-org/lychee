'use client';

import React, { useState } from 'react';
import LineChartPeriod from '@/components/ui/line-chart-period';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import Image from 'next/image';
import Filter, { Order, SortBy } from '@/components/ui/filter';
import type { ThemeData } from '../api/dashboard/getThemes';
import { ArrowBottomRightIcon, ArrowTopRightIcon } from '@radix-ui/react-icons';
import Delta from '@/components/ui/delta';

type ThemesListProps = {
  themes: ThemeData[];
};

export default function ThemesList({ themes: themes_ }: ThemesListProps) {
  const [themes, setThemes] = useState<ThemeData[]>([]);
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
    } else if (sortBy === 'update') {
      filteredThemes.sort(
        (a, b) =>
          a.ratings[a.ratings.length - 1].createdAt.getTime() -
          b.ratings[b.ratings.length - 1].createdAt.getTime()
      );
    } else if (sortBy === 'delta') {
      filteredThemes.sort((a, b) => a.delta - b.delta);
    }

    if (order === 'desc') {
      filteredThemes.reverse();
    }

    setThemes(filteredThemes);
  };

  return (
    <>
      <Filter updateFilter={updateFilter} />
      {themes.map(({ theme, ratings, rating, delta, nb }) => (
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
            <div className='flex flex-col items-center justify-center text-center w-48 gap-4'>
              <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
                {capitalize(theme)}
              </h3>
              <div className='flex gap-8 font-bold text-left'>
                <div>
                  <p className='text-xs text-muted-foreground tracking-tighter'>
                    Rating
                  </p>
                  <p className='text-xl'>{Math.round(rating)}</p>
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
              <LineChartPeriod data={ratings} theme={theme} />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
