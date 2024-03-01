import type { Metadata } from 'next';
import { Azeret_Mono, Inter } from 'next/font/google';
import './globals.css';
import './(styles)/chessground.css';
import './(styles)/cg-board.css';
import './(styles)/cg-pieces.css';
import { ThemeProvider } from '@/components/ui/theme-provider';
import NavbarWrapper from '@/components/ui/navbar-wrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const azeret_mono = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-azeret-mono',
});

export const metadata: Metadata = {
  title: 'Lychee',
  description: 'Your chess puzzle trainer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} ${azeret_mono.variable} font-sans`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <NavbarWrapper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
