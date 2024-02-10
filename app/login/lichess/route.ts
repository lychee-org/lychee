import { lichess } from '@/lib/auth';
import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await lichess.createAuthorizationURL(state, codeVerifier);

  cookies().set('lichess_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });
  cookies().set('lichess_oauth_code_validation', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  return Response.redirect(url);
}
