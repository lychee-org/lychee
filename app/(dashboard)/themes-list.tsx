'use client';

import React, { useState } from 'react';
import LineChartPeriod from '@/components/ui/line-chart-period';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize, toGroupId } from '@/lib/utils';
import Image from 'next/image';
import Filter, { Order, SortBy } from '@/components/ui/filter';
import type { ThemeData } from '../api/dashboard/getThemes';
import Delta from '@/components/ui/delta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { set } from 'mongoose';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type ThemesListProps = {
  themes: ThemeData[];
  missing: string[];
};

export default function ThemesList({
  themes: themes_,
  missing: missing_,
}: ThemesListProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  const themeImage = (theme: string) => {
    if (theme.includes('mateIn')) {
      return 'mate';
    }
    return theme;
  };

  const updateFilter = async (
    sortBy: SortBy,
    order: Order,
    filter: string
  ): Promise<void> => {
    const filteredThemes = themes_.filter((theme) =>
      theme.theme.toLowerCase().includes(filter)
    );
    const filteredMissing = missing_.filter((theme) =>
      theme.toLowerCase().includes(filter)
    );

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
    if (sortBy === 'alpha' && order === 'desc') {
      filteredMissing.reverse();
    }

    setThemes(filteredThemes);
    setMissing(filteredMissing);
  };

  const handleClick = (theme: string) => {
    if (selected.includes(theme)) {
      setSelected(selected.filter((t) => t !== theme));
    } else {
      setSelected([...selected, theme]);
    }
  };

  return (
    <div className={`${selected.length ? 'pb-20' : ''} space-y-8`}>
      <Filter updateFilter={updateFilter} />
      {themes.map(({ theme, ratings, rating, delta, nb }) => (
        <Card
          key={theme}
          className={
            selected.includes(theme)
              ? 'border-primary shadow-xl shadow-primary/10'
              : ''
          }
          onClick={() => {
            handleClick(theme);
          }}
        >
          <CardContent className='flex items-stretch h-48 gap-4 p-6'>
            <div className='flex justify-center items-center'>
              <div className='w-20 aspect-square relative'>
                <Image
                  src={`https://lichess1.org/assets/_SQ9ycq/images/puzzle-themes/${themeImage(theme)}.svg`}
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
      {themes.length === 0 && (
        <div className='text-center text-muted-foreground'>
          No data history for themes, please train on some puzzles and check
          back
        </div>
      )}
      {missing.length > 0 && (
        <>
          <Separator />
          <div className='grid grid-cols-2 gap-8'>
            {missing.map((theme) => (
              <Card
                key={theme}
                className={
                  selected.includes(theme)
                    ? 'border-primary shadow-xl shadow-primary/10 text-muted-foreground'
                    : 'text-muted-foreground'
                }
                onClick={() => {
                  handleClick(theme);
                }}
              >
                <CardContent className='flex items-stretch h-48 gap-4 p-6'>
                  <div className='flex justify-center items-center'>
                    <div className='w-20 aspect-square relative'>
                      <Image
                        src={`https://lichess1.org/assets/_SQ9ycq/images/puzzle-themes/${themeImage(theme)}.svg`}
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
                        <p className='text-xl'>N/A</p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground tracking-tighter'>
                          Delta
                        </p>
                        <Delta delta={0} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {selected.length > 0 && (
        <div className='flex justify-center fixed w-screen bottom-0 left-0 items-center p-4 gap-12 lg:px-12 bg-card border rounded-t-lg shadow-[rgba(0,0,15,0.5)_0px_-10px_40px_5px]'>
          <div className='space-y-3 flex flex-col items-center max-w-2xl'>
            <div className='font-bold tracking-tight'>
              Selected {selected.length} theme{selected.length > 1 ? 's' : ''}{' '}
              to train
            </div>
            <div className='flex gap-1 flex-wrap justify-center'>
              {selected.map((theme) => {
                return (
                  <Badge variant={'outline'} onClick={() => handleClick(theme)}>
                    {capitalize(theme).toLowerCase()}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div className='flex gap-4'>
            <Button
              onClick={() => {
                setSelected([]);
              }}
              variant={'secondary'}
            >
              Deselect
            </Button>
            <Link href={`/puzzle/group/${toGroupId(selected)}`}>
              <Button>Train</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
