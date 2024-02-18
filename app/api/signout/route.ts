import { logout } from '@/lib/auth';
import { dbConnect } from '@/lib/db';

import type { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
  await dbConnect();
  await logout();
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/', // redirect to home page
    },
  });
};
