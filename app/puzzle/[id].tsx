import PuzzleBoard from "@/components/puzzle-board";
import { useRouter } from "next/router";

export default async function TestBoard() {
    const router = useRouter();
    const puzzleId = (router.query.id ?? "01z3g") as string;
    // const { puzzle } = await fetch(`https://lichess.org/api/puzzle/${puzzleId}`).then((res) => res.json());
    return <div>nick wu is my dad</div>
}
