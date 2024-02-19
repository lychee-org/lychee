import { LastBatchColl } from "@/models/LastBatch";
import { Puzzle } from "@/types/lichess-api";
import { User } from "lucia";

// Returns empty array if no last batch is found.
const lastBatchFor = async (user: User): Promise<Puzzle[]> => {
  const lastBatch = await LastBatchColl.findOne({ username: user.username });
  return lastBatch ? lastBatch.batch : [];
}

export default lastBatchFor;
