import GamesAnalysis from "./games-analysis.ts";
import GameAnalysis from "./game-analysis.ts";
import gameAnalysis from "./game-analysis.ts";

class GameAnalyser {


    static analyseGames(gameAnalyses: Array<GameAnalysis>): GamesAnalysis {

        return {
            totalGames: gameAnalyses.length,
            winRate: 0,
            winRateWhite: 0,
            winRateBlack: 0,
            averageTotalMovesPerGame: this.getAverageTotalMovesPerGame(gameAnalyses),
            averageFirstBlunder: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.blunders),
            averageFirstMistake: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.mistakes),
            averageFirstInaccuracy: this.getAverageFirstMoveOfType(gameAnalyses, (gameAnalysis: GameAnalysis) => gameAnalysis.inaccuracies)
        }

    }

    private static getAverageTotalMovesPerGame(gameAnalyses: Array<GameAnalysis>): number {

        return -1;
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