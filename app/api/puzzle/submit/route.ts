import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { NextRequest } from 'next/server';

interface SubmitPuzzleBody {
  puzzleId: string;
  correct: boolean;
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await req.json();
  const { puzzleId, correct } = body;
  console.log(user);
  // await mongoose.connection.collection('rounds').updateOne(
  //   { userId: user.id },
  //   {
  //     $addToSet: {
  //       puzzles: {
  //         puzzleId,
  //         correct
  //       }
  //     }
  //   },
  //   { upsert: true }
  // )
  console.log(body);
  return new Response(null, { status: 200 });
}