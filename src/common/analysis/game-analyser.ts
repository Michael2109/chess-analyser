import GameEvaluation from "../evaluation/game-evaluation.ts";
import GameAnalysis from "./game-analysis.ts";

class GameAnalyser {

    static analyseGame(gameEvaluation: GameEvaluation): GameAnalysis {

        return {
            inaccuracies: this.findScoreChanges(gameEvaluation, 20, 50),
            mistakes: this.findScoreChanges(gameEvaluation, 50, 150),
            blunders: this.findScoreChanges(gameEvaluation, 150, Number.MAX_VALUE)
        }
    }

    private static findScoreChanges(gameEvaluation: GameEvaluation, centipawnMin: number, centipawnMax: number): Array<number> {

        const isWhite = gameEvaluation.isWhite
        const blunders: Array<number> = []

        let previousScore = 0;


        for (let moveIndex = 0; moveIndex < gameEvaluation.moveEvaluations.length; moveIndex++) {
            const moveEvaluation = gameEvaluation.moveEvaluations[moveIndex]


            if (isWhite && moveIndex % 2 === 0) {

                // Whites move
                if (moveEvaluation.difference < -centipawnMax && moveEvaluation.difference > -centipawnMin) {

                    blunders.push(moveIndex)
                }
            }
            if (!isWhite && moveIndex % 2 === 1) {

                // Blacks move
                if (moveEvaluation.difference > centipawnMin && moveEvaluation.difference < centipawnMax) {
                    blunders.push(moveIndex)

                }
            }

            previousScore = moveEvaluation.score
        }
        return blunders
    }
}

export default GameAnalyser