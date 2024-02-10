import { validateRequest } from '@/lib/auth';
import Unauthorized from './unauthorized';

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) {
    return <Unauthorized />;
  }
  return <h1>Hi, {user.username}!</h1>;
}
