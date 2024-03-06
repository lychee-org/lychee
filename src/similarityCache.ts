import mongoose from "mongoose";
import { Puzzle } from '../types/lichess-api';
//import { puzzleFromDocument } from "../app/api/puzzle/nextPuzzle/nextFor";
import similarity_distance from '../src/similarity';
import { SimilarityColl } from '../models/SimilarityColl';

const puzzleFromDocument = (document: any): Puzzle => {
    let { _id: _, ...rest } = document;
    
    return rest as any as Puzzle;
  };

export interface SimilarityInstance {
    puzzleId: String;
    cache: Array<String>;
}

export const findSimilarityInstance = async (
    puzzleId: String
  ): Promise<SimilarityInstance | undefined> => {
    const similarityInstance = await SimilarityColl.findOne({ puzzleId: puzzleId });
    
    return similarityInstance ? { puzzleId: similarityInstance.puzzleId, cache: similarityInstance.cache } : undefined;
  };

// const findPuzzlebyId = async (
//     puzzleId: String
//   ): Promise<Puzzle | undefined> => {
//     const p = await mongoose.connection.collection('testPuzzles').findOne({
//       PuzzleId: { PuzzleId: puzzleId },
//       },
//     );
   
//     return puzzleFromDocument(p);
// };

export const computeSimilarityCache = async(
    puzzle: Puzzle
    ): Promise<Array<String>> => {
    const allPuzzles = (await mongoose.connection.collection('testPuzzles').find().toArray()).map(puzzleFromDocument);
    
    if(!allPuzzles) {
        throw new Error("cant get all puzzles from testPuzzles")
    }
    
    let distanceList = allPuzzles.map(p => [p.PuzzleId, similarity_distance(p.hierarchy_tags,  puzzle.hierarchy_tags)]);
    distanceList.sort((a, b) => (a[1] as number) - (b[1] as number));
    distanceList = distanceList.slice(0, 5);
    const similarityCache = distanceList.map(e => e[0])
    
    return similarityCache as String[];
}

// export const updateSimlarity = async (
// 	puzzle: Puzzle
//   ): Promise<void> => {
//     await SimilarityColl.create({
//         puzzleId: "00008",
//         cache: []
//       });
//     const c: SimilarityInstance = {puzzleId: "00008", cache: await computeSimilarityCache(puzzle)}
// 	SimilarityColl.updateOne({puzzleId: "00008"}, c)
//   }



