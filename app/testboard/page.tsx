import { dbConnect } from '@/lib/db';
import PuzzleMode from '@/components/puzzle-ui/puzzle-mode';
import React from 'react';
import { validateRequest } from '@/lib/auth';
import { getPuzzleBatch } from '../api/puzzle/nextbatch/nextbatch';
import { getUserInfo } from '../api/user/info/getUserInfo';

export default async function TestBoard() {
  await dbConnect()
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const userInfo = getUserInfo(user);

  const puzzles = await getPuzzleBatch(user, []);
  return <PuzzleMode initialPuzzleBatch={puzzles} userInfo={userInfo} />;
}
