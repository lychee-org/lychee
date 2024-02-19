import { dbConnect } from '@/lib/db';
import React from 'react';
import { validateRequest } from '@/lib/auth';
import { getExistingUserRating } from '@/rating/getRating';
import WoodpeckerLoader from '@/components/woodpecker/loader';
import { AllRoundColl } from '@/models/AllRoundColl';

export default async function TestBoard() {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Temporarily clear solved puzzles:
  await AllRoundColl.deleteOne({ username: user.username });
  await AllRoundColl.create({
    username: user.username,
    solved: [],
  });

  const r = await getExistingUserRating(user);
  return <WoodpeckerLoader rating={{ rating: r.rating, ratingDeviation: r.ratingDeviation, volatility: r.volatility, numberOfResults: r.numberOfResults }} />;
}
