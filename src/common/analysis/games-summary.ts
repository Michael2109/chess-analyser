interface GamesSummary {
  totalGames: number;
  winRate: number;
  loseRate: number;
  winRateWhite: number;
  loseRateWhite: number;
  winRateBlack: number;
  loseRateBlack: number;
  averageTotalMovesPerGame: number;
  averageFirstBlunder: number;
  averageFirstMistake: number;
  averageFirstInaccuracy: number;
}

export default GamesSummary;
