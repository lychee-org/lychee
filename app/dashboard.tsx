import React from 'react';
import LineChartPeriod from '@/components/ui/line-chart-period';
import { dbConnect } from '@/lib/db';
import { validateRequest } from '@/lib/auth';
import { getThemes } from './api/dashboard/getThemes';
import { Card, CardContent } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import Image from 'next/image';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
export default async function Dashboard() {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const themes = await getThemes(user);

  return (
    <div>
      <form>

      <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
    </form>
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
    </div>
    // <div className='h-svh flex flex-col items-center pt-12'>
    //   <div className='flex flex-col max-w-3xl w-full items-stretch gap-8'>
    //     <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
    //       Dashboard
    //     </h1>
    //     <p className='text-xl text-muted-foreground text-center'>
    //       Track your progress over time.
    //     </p>

    //     <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center'>
    //       Themes
    //     </h1>
    //     {themes.map(({ theme, ratings, rating, nb }) => (
    //       <Card key={theme}>
    //         <CardContent className='flex items-stretch h-48 gap-4 p-6'>
    //           <div className='flex justify-center items-center'>
    //             <div className='w-20 aspect-square relative'>
    //               <Image
    //                 src={`https://lichess1.org/assets/_SQ9ycq/images/puzzle-themes/${theme}.svg`}
    //                 fill
    //                 className='object-cover'
    //                 alt={theme}
    //               />
    //             </div>
    //           </div>
    //           <div className='flex flex-col items-center justify-center text-center w-48'>
    //             <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
    //               {capitalize(theme)}
    //             </h3>
    //             <p className='text-xl text-muted-foreground'>
    //               {Math.round(rating)}
    //             </p>
    //           </div>
    //           <div className='flex-1'>
    //             <LineChartPeriod data={ratings} />
    //           </div>
    //         </CardContent>
    //       </Card>
    //     ))}
    //   </div>
    // </div>
  );
}
