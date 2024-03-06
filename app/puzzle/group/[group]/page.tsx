import { addRecentGroup } from '@/app/api/dashboard/recentGroups';
import { validateRequest } from '@/lib/auth';
import { toGroup } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function Group({ params }: { params: { group: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/');
  }
  const group = toGroup(params.group);
  if (group.length === 0) {
    return redirect('/');
  }
  addRecentGroup(user.username, params.group);

  return (
    <div>
      {group.map((theme) => {
        return <div>{theme}</div>;
      })}
    </div>
  );
}
