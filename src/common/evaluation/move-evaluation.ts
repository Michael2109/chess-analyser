
interface MoveEvaluation {
    index: number;
    move: string;
    score: number;
    fen?: string;
    difference: number
}

export default MoveEvaluation