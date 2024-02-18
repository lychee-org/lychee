'use client';

import React from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/auth-button';
import ModeToggler from './mode-toggle';

type NavbarProps = {
  user: any;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="z-50 flex max-h-14 w-full min-w-max flex-row items-center justify-start gap-3 border-b bg-background/95 p-4 md:pl-4">
      <div>
        <Link href="/" className='font-bold text-xl'>
          Lychee_
        </Link>
      </div>
      <div className="flex-grow"></div>
      <AuthButton user={user} className="" />
      <ModeToggler className="" />
    </nav>
  );
}