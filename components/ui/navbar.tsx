'use client';

import React from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/auth-button';
import ModeToggler from './mode-toggle';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

type NavbarProps = {
  user: any;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className='z-50 flex max-h-14 w-full min-w-max flex-row items-center justify-start gap-3 border-b bg-background/95 p-4 md:pl-4'>
      <div>
        <Link href='/' className='font-bold text-xl'>
          Lychee_
        </Link>
      </div>
      <div className='m-8 text-sm underline font-mono block sm:hidden'><a href='/trainer'>Trainer</a></div>
      <div className='flex-grow'></div>
      <AuthButton user={user} className='block sm:hidden' />
      <ModeToggler className='block sm:hidden' />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild className='hidden sm:block'>
          <button className="IconButton" aria-label="Menu">
            <HamburgerMenuIcon />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
            <DropdownMenu.Item className="bg-background hover:bg-foreground hover:text-background">
              <Link href='/trainer'>Trainer</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="bg-background">
              <AuthButton user={user} className='' />
            </DropdownMenu.Item>
            <DropdownMenu.Item className="bg-background">
              <ModeToggler className='' />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </nav>
  );
}
