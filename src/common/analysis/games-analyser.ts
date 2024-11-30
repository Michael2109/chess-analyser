import GamesSummary from "./games-summary.ts";
import GameAnalysis from "./game-analysis.ts";
import {EndStatus} from "../evaluation/game-evaluation.ts";

class GameAnalyser {


    static summariseGames(gameAnalyses: Array<GameAnalysis>): GamesSummary {

        return {
            totalGames: gameAnalyses.length,
            winRate: this.getWinRate(gameAnalyses),
            loseRate: 1 - this.getWinRate(gameAnalyses),
            winRateWhite: this.getWinRate(gameAnalyses.filter(gameAnalysis => gameAnalysis.isWhite)),
            winRateBlack: this.getWinRate(gameAnalyses.filter(gameAnalysis => !gameAnalysis.isWhite)),
            loseRateWhite: 1 - this.getWinRate(gameAnalyses.filter(gameAnalysis => gameAnalysis.isWhite)),
            loseRateBlack: 1 - this.getWinRate(gameAnalyses.filter(gameAnalysis => !gameAnalysis.isWhite)),
            averageTotalMovesPerGame: this.getAverageTotalMovesPerGame(gameAnalyses),
            averageFirstBlunder: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.blunders),
            averageFirstMistake: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.mistakes),
            averageFirstInaccuracy: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.inaccuracies)
        }
    }

    private static getWinRate(gameAnalyses: Array<GameAnalysis>): number {
        const totalWins = gameAnalyses.filter(gameAnalysis => gameAnalysis.endInfo.status === EndStatus.WIN).length
        return totalWins / gameAnalyses.length
    }

    private static getAverageTotalMovesPerGame(gameAnalyses: Array<GameAnalysis>): number {

        const totalMoves = gameAnalyses.map(gameAnalysis => gameAnalysis.totalMoves).reduce((a, b) => a + b, 0);

        return totalMoves / gameAnalyses.length;
    }

    private static getAverageFirstMoveOfType(gameAnalyses: Array<GameAnalysis>, getMoves: (gameAnalysis: GameAnalysis) => Array<number>): number {
        const firstBlunders = gameAnalyses
            .map(gameAnalysis => getMoves(gameAnalysis))
            .filter(moves => moves.length > 0)
            .map(moves => moves[0])

        return firstBlunders.reduce((p, c) => p + c, 0) / firstBlunders.length
    }
}

export default GameAnalyser