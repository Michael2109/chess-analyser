type Rates = {
  win: number;
  lose: number;
  draw: number;
};

interface GamesSummary {
  totalGames: number;
  rates: Rates;
  whiteRates: Rates;
  blackRates: Rates;
  accuracy: number;
  averageTotalMovesPerGame: number;
  averageFirstBlunder: number;
  averageFirstMistake: number;
  averageFirstInaccuracy: number;
}

export default GamesSummary;
export type { Rates };
