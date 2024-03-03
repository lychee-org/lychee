'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LineChart } from './line-chart';
import { useDimensions } from '@/hooks/useDimensions';
import { timeDay, timeHour, timeMonth, timeWeek, timeYear } from 'd3-time';

type Datapoint = { createdAt: Date; rating: number };
type LineChartPeriodProps = {
  data: Datapoint[];
  theme: string;
};

export default function LineChartPeriod({ data, theme }: LineChartPeriodProps) {
  const [period, setPeriod] = useState('1d');
  const container = useRef(null);
  const { width, height } = useDimensions(container);
  const offset = useCallback(
    (d: Date) => {
      switch (period) {
        case '1h':
          d = timeHour.offset(d, -1);
          break;
        case '1d':
          d = timeDay.offset(d, -1);
          break;
        case '1w':
          d = timeWeek.offset(d, -1);
          break;
        case '1m':
          d = timeMonth.offset(d, -1);
          break;
        case '3m':
          d = timeMonth.offset(d, -3);
          break;
        case '1y':
          d = timeYear.offset(d, -1);
          break;
      }
      return d;
    },
    [period]
  );

  return (
    <div className='flex flex-col w-full h-full items-stretch'>
      <RadioGroup
        defaultValue='1d'
        className='flex gap-2 justify-center'
        value={period}
        onValueChange={(v) => {
          console.log("hehellweo", v)
          setPeriod(v);
        }}
      >
        <Chip text='1H' value='1h' theme={theme} />
        <Chip text='1D' value='1d' theme={theme} />
        <Chip text='1W' value='1w' theme={theme} />
        <Chip text='1M' value='1m' theme={theme} />
        <Chip text='3M' value='3m' theme={theme} />
        <Chip text='1Y' value='1y' theme={theme} />
      </RadioGroup>
      <div ref={container} className='flex-1'>
        <LineChart width={width} height={height} data={data} offset={offset} />
      </div>
    </div>
  );
}

function Chip({ text, theme, value }: { text: string; theme: string, value: string }) {
  return (
    <div>
      <RadioGroupItem id={`${value}-${theme}`} value={value} className='peer sr-only' />
      <Label
        htmlFor={`${value}-${theme}`}
        className='flex rounded-full border-2 border-muted bg-popover px-3 py-1 text-xs hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-background peer-data-[state=checked]:border-primary'
      >
        {text}
      </Label>
    </div>
  );
}
