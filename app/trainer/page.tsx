import { dbConnect } from '@/lib/db';
import PuzzleMode from '@/components/puzzle-ui/puzzle-mode';
import React from 'react';
import { validateRequest } from '@/lib/auth';
import nextPuzzleFor from '../api/puzzle/nextPuzzle/nextFor';
import { redirect } from 'next/navigation';

export default async function TestBoard() {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/');
  }
  const { puzzle, rating, similar } = await nextPuzzleFor(user);
  return (
    <PuzzleMode
      initialPuzzle={puzzle}
      initialRating={rating}
      initialSimilar={similar}
      group={[]}
    />
  );
}
