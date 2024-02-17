import { validateRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "lucia";
import { NextRequest } from "next/server";

export interface UserInfo {
  username?: string;
  rating?: number;
}
export async function getUserInfo(user: User) {

  const { perfs } = await fetch(`https://lichess.org/api/user/${user?.username}`).then((res) => res.json());
  const rating = perfs['puzzle']['rating'];

  const userInfo: UserInfo = {
    username: user.username,
    rating
  };
  return userInfo;
}