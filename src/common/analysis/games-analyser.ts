import GamesSummary, { Rates } from "./games-summary.ts";
import GameAnalysis from "./game-analysis.ts";
import { EndStatus } from "../evaluation/game-evaluation.ts";
import gameAnalysis from "./game-analysis.ts";

class GameAnalyser {
  static summariseGames(gameAnalyses: Array<GameAnalysis>): GamesSummary {
    return {
      totalGames: gameAnalyses.length,
      rates: this.getRates(gameAnalyses),
      whiteRates: this.getRates(
        gameAnalyses.filter((gameAnalysis) => gameAnalysis.isWhite),
      ),
      blackRates: this.getRates(
        gameAnalyses.filter((gameAnalysis) => !gameAnalysis.isWhite),
      ),
      accuracy: this.getAverageAccuracy(gameAnalyses),
      averageTotalMovesPerGame: this.getAverageTotalMovesPerGame(gameAnalyses),
      averageFirstBlunder: this.getAverageFirstMoveOfType(
        gameAnalyses,
        (gameAnalysis: GameAnalysis) => gameAnalysis.blunders,
      ),
      averageFirstMistake: this.getAverageFirstMoveOfType(
        gameAnalyses,
        (gameAnalysis: GameAnalysis) => gameAnalysis.mistakes,
      ),
      averageFirstInaccuracy: this.getAverageFirstMoveOfType(
        gameAnalyses,
        (gameAnalysis: GameAnalysis) => gameAnalysis.inaccuracies,
      ),
    };
  }

  private static getRates(gameAnalyses: Array<GameAnalysis>): Rates {
    const totals = gameAnalyses.reduce(
      (acc, curr) => {
        acc[curr.endInfo.status]++;
        return acc;
      },
      { [EndStatus.WIN]: 0, [EndStatus.LOSS]: 0, [EndStatus.DRAW]: 0 }, // Initial accumulator
    );

    return {
      win: totals[EndStatus.WIN] / gameAnalyses.length,
      lose: totals[EndStatus.LOSS] / gameAnalyses.length,
      draw: totals[EndStatus.DRAW] / gameAnalyses.length,
    };
  }

  private static getAverageAccuracy(gameAnalyses: Array<GameAnalysis>): number {
    const gamesWithMoves = gameAnalyses.filter(
      (gameAnalysis) =>
        (gameAnalysis.isWhite && gameAnalysis.totalMoves > 0) ||
        (!gameAnalysis.isWhite && gameAnalysis.totalMoves > 1),
    );

    const totalAccuracies = gamesWithMoves
      .map((gameAnalysis) => {
        const inaccuracies =
          gameAnalysis.inaccuracies.length +
          gameAnalysis.mistakes.length +
          gameAnalysis.blunders.length;

        const moves = Math.floor(gameAnalysis.totalMoves / 2) + 1;

        const accurateMoves = moves - inaccuracies;

        console.log(accurateMoves + " / " + moves);

        return accurateMoves / moves;
      })
      .reduce((a, b) => a + b, 0);

    return totalAccuracies / gamesWithMoves.length;
  }

  private static getAverageTotalMovesPerGame(
    gameAnalyses: Array<GameAnalysis>,
  ): number {
    const totalMoves = gameAnalyses
      .map((gameAnalysis) => gameAnalysis.totalMoves)
      .reduce((a, b) => a + b, 0);

    return totalMoves / gameAnalyses.length;
  }

  private static getAverageFirstMoveOfType(
    gameAnalyses: Array<GameAnalysis>,
    getMoves: (gameAnalysis: GameAnalysis) => Array<number>,
  ): number {
    const firstBlunders = gameAnalyses
      .map((gameAnalysis) => getMoves(gameAnalysis))
      .filter((moves) => moves.length > 0)
      .map((moves) => moves[0]);

    return firstBlunders.reduce((p, c) => p + c, 0) / firstBlunders.length;
  }
}

export default GameAnalyser;
