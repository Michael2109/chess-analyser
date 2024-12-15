declare module "stockfish" {
  // Define the type of the exported Stockfish function
  const Stockfish: () => StockfishEngine;

  export interface StockfishEngine {
    postMessage: (message: string) => void;
    onmessage: (callback: (message: string) => void) => void;
  }

  export default Stockfish;
}
