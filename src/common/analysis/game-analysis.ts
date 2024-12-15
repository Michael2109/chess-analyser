import { EndInfo } from "../evaluation/game-evaluation.ts";
import { Dayjs } from "dayjs";

interface GameAnalysis {
  date: Dayjs;
  isWhite: boolean;
  totalMoves: number;
  endInfo: EndInfo;
  inaccuracies: Array<number>;
  mistakes: Array<number>;
  blunders: Array<number>;
  midgameStart: number;
  endgameStart: number;
}

export default GameAnalysis;
