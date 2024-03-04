import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@radix-ui/react-label';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Input } from './input';

export type SortBy = 'alpha' | 'update' | 'delta' | 'rating';
export type Order = 'asc' | 'desc';

type FilterProps = {
  updateFilter: (sortBy: SortBy, order: Order, filter: string) => any;
};

export default function Filter({ updateFilter }: FilterProps) {
  const sortByOpts = [
    {
      value: 'alpha',
      text: 'Alphabetical',
    },
    {
      value: 'update',
      text: 'Updated',
    },
    {
      value: 'delta',
      text: 'Delta',
    },
    {
      value: 'rating',
      text: 'Rating',
    },
  ];
  const directionsOpts = [
    {
      value: 'asc',
      text: 'Ascending',
    },
    {
      value: 'desc',
      text: 'Descending',
    },
  ];

  const [sortBy, setSortBy] = useState<SortBy>('alpha');
  const [order, setOrder] = useState<Order>('asc');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    updateFilter(sortBy, order, filter);
  }, [sortBy, order, filter, updateFilter]);

  return (
    <div className='flex gap-4 items-center'>
      <Group options={sortByOpts} value={sortBy} onValueChange={setSortBy} />
      <Group options={directionsOpts} value={order} onValueChange={setOrder} />
      <form className='grow'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search'
            className='pl-8 h-fit rounded-lg text-xs border-none bg-secondary py-2'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}

type GroupProps = {
  options: {
    value: string;
    text: string;
  }[];
  value: string;
  onValueChange?: (v: any) => void;
};

function Group({ options, value, onValueChange }: GroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className='flex p-1 gap-1 bg-secondary rounded-lg'
    >
      {options.map(({ text, value }) => (
        <div key={value}>
          <RadioGroupItem id={value} value={value} className='peer sr-only' />
          <Label
            htmlFor={value}
            className='flex rounded-md bg-transparent px-3 py-1 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-background transition-all'
          >
            {text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
