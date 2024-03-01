import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';
import { getUserInfo } from './getUserInfo';

export interface UserInfo {
  username?: string;
  rating?: number;
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const userInfo = getUserInfo(user);
  return new Response(JSON.stringify(userInfo), { status: 200 });
}
