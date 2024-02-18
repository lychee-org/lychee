import { dbConnect } from '@/lib/db';
import PuzzleMode from '@/components/puzzle-ui/puzzle-mode';
import React from 'react';
import { validateRequest } from '@/lib/auth';
import nextPuzzleFor from '../api/puzzle/nextPuzzle/nextFor';

export default async function TestBoard() {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { puzzle, rating } = await nextPuzzleFor(user)
  // console.log(puzzle, rating)

  return <PuzzleMode initialPuzzle={puzzle} initialRating={rating} />;
}
