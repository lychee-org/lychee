'use client';

import React from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/auth-button';
import ModeToggler from './mode-toggle';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { User } from 'lucia';
import { Button } from './button';

type NavbarProps = {
  user: User | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className='z-50 flex max-h-14 w-full min-w-max flex-row items-center justify-start gap-3 border-b bg-background/95 p-4 md:pl-4'>
      <div>
        <Link href='/' className='font-bold text-xl'>
          Lychee_
        </Link>
      </div>
      {user !== null && (
        <>
          <div className='ml-8 text-sm underline font-mono block sm:hidden'>
            <Link href='/'>
              <Button
                className='flex-row p-2 font-mono w-full underline'
                variant='ghost'
              >
                Dashboard
              </Button>
            </Link>
          </div>
          <div className='text-sm underline font-mono block sm:hidden'>
            <Link href='/trainer'>
              <Button
                className='flex-row p-2 font-mono w-full underline'
                variant='ghost'
              >
                Trainer
              </Button>
            </Link>
          </div>
        </>
      )}

      <div className='flex-grow'></div>
      <AuthButton user={user} className='block sm:hidden' />
      <ModeToggler className='block sm:hidden' />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild className='hidden sm:block'>
          <button className='IconButton' aria-label='Menu'>
            <HamburgerMenuIcon />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className='DropdownMenuContent' sideOffset={5}>
            <DropdownMenu.Item className='bg-background w-full'>
              <Link href='/trainer'>
                <Button
                  className='flex-row p-2 font-mono w-full'
                  variant='ghost'
                >
                  Trainer
                </Button>
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className='bg-background w-full'>
              <AuthButton user={user} className='' />
            </DropdownMenu.Item>
            <DropdownMenu.Item className='bg-background w-full'>
              <ModeToggler className='w-full' />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </nav>
  );
}
