import MoveEvaluation from "./move-evaluation.ts";
import Player from "./player.ts";

interface GameEvaluation {
    white?: Player,
    black?: Player,
    isWhite: boolean,
    timeControl: string,
    uuid: string,
    url: string,
    moveEvaluations: Array<MoveEvaluation>
}

export default GameEvaluation