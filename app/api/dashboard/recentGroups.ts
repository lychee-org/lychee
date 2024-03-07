import { RecentGroup } from '@/models/RecentGroup';

type RecentGroup = {
  username: string;
  groupId: string;
  lastUsed: Date;
};

export const getRecentGroups = async (
  username: string
): Promise<RecentGroup[]> => {
  return RecentGroup.find({ username }).sort({ lastUsed: -1 });
};

export const addRecentGroup = async (
  username: string,
  groupId: string
): Promise<void> => {
  await RecentGroup.updateOne(
    { username, groupId },
    { lastUsed: new Date() },
    { upsert: true }
  );
};
