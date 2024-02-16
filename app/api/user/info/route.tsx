import { validateRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { NextRequest } from "next/server";

export interface UserInfo {
  username?: string;
  rating?: number;
}

export async function GET(req: NextRequest) {
  await dbConnect()
  const { user } = await validateRequest();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { perfs } = await fetch(`https://lichess.org/api/user/${user?.username}`).then((res) => res.json());
  const rating = perfs['puzzle']['rating'];

  const userInfo: UserInfo = {
    username: user.username,
    rating: rating
  };
  return new Response(JSON.stringify(userInfo), { status: 200 });
}