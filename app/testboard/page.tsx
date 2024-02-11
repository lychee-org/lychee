import PuzzleBoard from "@/components/puzzle-board";

export default async function TestBoard() {
  const puzzle = {
    "_id": "01tg7",
    "gameId": "TaHSAsYD",
    "fen": "8/1bnr2pk/4pq1p/p1p1Rp2/P1B2P2/1PP3Q1/3r1BPP/4R1K1 w - - 1 44",
    "themes": [
      "middlegame",
      "short",
      "fork",
      "advantage"
    ],
    "glicko": {
      "r": 1545.9399131970683,
      "d": 76.3329653428455,
      "v": 0.0899168528207159
    },
    "plays": 12153,
    "vote": 0.9266055226325989,
    "line": "f2c5 d2g2 g3g2 b7g2",
    "generator": 14,
    "cp": 468,
    "vd": 8,
    "vu": 210,
    "users": [
      "reda",
      "cted"
    ]
  }

  return <PuzzleBoard puzzle={puzzle} />
}
