import React from 'react';
import { User } from 'lucia';
import { getThemes } from '../api/dashboard/getThemes';
import Dashboard from './dashboard';

export default async function DashboardWrapper({ user }: { user: User }) {
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
        <Dashboard themes={themes} />
      </div>
    </div>
  );
}
