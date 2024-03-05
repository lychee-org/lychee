import { ArrowBottomRightIcon, ArrowTopRightIcon, DashIcon } from '@radix-ui/react-icons';
import React from 'react';

export default function Delta({ delta }: { delta: number }) {
  return (
    <div className='flex items-center gap-1'>
      <p className='text-xl'>{Math.round(delta)}</p>
      {delta > 0 ? (
        <ArrowTopRightIcon className='inline w-5 h-5 text-green-500' />
      ) : delta < 0 ? (
        <ArrowBottomRightIcon className='inline w-5 h-5 text-red-500' />
      ) : (
        <DashIcon className='inline w-5 h-5 text-muted-foreground' />
      )}
    </div>
  );
}
