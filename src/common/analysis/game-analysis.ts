import {EndInfo} from "../evaluation/game-evaluation.ts";

interface GameAnalysis {
    isWhite: boolean
    totalMoves: number
    endInfo: EndInfo
    inaccuracies: Array<number>
    mistakes: Array<number>
    blunders: Array<number>
}

export default GameAnalysis