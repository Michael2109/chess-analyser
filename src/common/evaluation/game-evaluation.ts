import MoveEvaluation from "./move-evaluation.ts";
import Player from "./player.ts";

enum EndStatus {
    WIN,
    LOSS,
    DRAW
}

interface EndInfo {
    status: EndStatus
}

interface GameEvaluation {
    white: Player,
    black: Player,
    resigned: boolean,
    opponentResigned: boolean,
    isWhite: boolean,
    timeControl: string,
    uuid: string,
    url: string,
    moveEvaluations: Array<MoveEvaluation>
    endInfo: EndInfo
}

export type {EndInfo}
export  {EndStatus}
export default GameEvaluation