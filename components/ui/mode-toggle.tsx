import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

interface ModeTogglerProps {
  className: string;
}

export default function ModeToggler({ className }: ModeTogglerProps) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant='ghost'
      className={cn(`px-2`, className)}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <MoonIcon className=' block rotate-0 scale-100 transition-all dark:hidden dark:-rotate-90 dark:scale-0' />
      <SunIcon className=' rotate-290 hidden scale-0 transition-all dark:block dark:rotate-0 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
