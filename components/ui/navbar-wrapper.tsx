import { validateRequest } from '@/lib/auth';
import Navbar from './navbar';
import { dbConnect } from '@/lib/db';

export default async function NavbarWrapper() {
  await dbConnect();
  const { user } = await validateRequest();
  return <Navbar user={user} />;
}
