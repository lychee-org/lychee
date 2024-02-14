import PuzzleMode from '@/components/puzzle-mode';
import { dbConnect } from '@/lib/db';
import { Puzzle } from '@/types/lichess-api';
import React from 'react';
import { BASE_URL } from '@/config/base-url';
import mongoose from 'mongoose';
import { validateRequest } from '@/lib/auth';
import { error } from 'console';
import { getPuzzleBatch } from '../api/nextpuzzlebatch/route';

const RATING_RADIUS = 300

export default async function TestBoard() {
  await dbConnect()
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const puzzles = await getPuzzleBatch(user, []);

  return <PuzzleMode initialPuzzleBatch={puzzles} />;
}
