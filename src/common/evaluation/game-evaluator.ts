import GameDto from "../game-dto.ts";
import pgnParser from "pgn-parser";
import { Chess } from "chess.js";
import MoveEvaluation from "./move-evaluation.ts";
import { EndStatus } from "./game-evaluation.ts";
import EvaluationStatus from "./evaluation-status.ts";
import GameAnalysis from "../analysis/game-analysis.ts";

const STOCKFISH_DEPTH = 8;

class GameEvaluator {
  static getStockfishMoveCommand(
    moves: Array<string>,
    moveNumber: number,
  ): string {
    return "position startpos moves " + moves.slice(0, moveNumber).join(" ");
  }

  static extractMovesFromPgn(pgn: string) {
    const [result] = pgnParser.parse(pgn);

    const chess = new Chess(); // Starts with the standard initial position

    const lanMoves: Array<string> = [];

    // Loop through each move in SAN
    for (const pgnMove of result.moves) {
      const sanMove = pgnMove.move;
      // Apply the SAN move to the board
      const move = chess.move(sanMove);

      if (!move) {
        console.error(`Invalid move: ${sanMove}`);
        break;
      }

      // Convert to long algebraic notation (LAN)
      const lanMove = `${move.from}${move.to}${move.promotion || ""}`; // Include promotion if any
      lanMoves.push(lanMove);
    }

    return lanMoves;
  }

  static getEndStatus(gameDto: GameDto, isWhite: boolean): EndStatus {
    const playerInfo = isWhite ? gameDto.white : gameDto.black;
    switch (playerInfo.result) {
      case "win":
        return EndStatus.WIN;
      case "checkmated":
        return EndStatus.LOSS;
      case "agreed":
        return EndStatus.DRAW;
      case "repetition":
        return EndStatus.DRAW;
      case "timeout":
        return EndStatus.LOSS;
      case "resigned":
        return EndStatus.LOSS;
      case "stalemate":
        return EndStatus.DRAW;
      case "lose":
        return EndStatus.LOSS;
      case "insufficient":
        return EndStatus.DRAW;
      case "50move":
        return EndStatus.DRAW;
      case "abandoned":
        return EndStatus.LOSS;
      case "timevsinsufficient":
        return EndStatus.DRAW;
      default:
        throw new Error(`Unknown result: ${playerInfo.result}`);
    }
  }

  private static findScoreChanges(
    isWhite: boolean,
    moveEvaluations: Array<MoveEvaluation>,
    centipawnMin: number,
    centipawnMax: number,
  ): Array<number> {
    const blunders: Array<number> = [];

    for (let moveIndex = 0; moveIndex < moveEvaluations.length; moveIndex++) {
      const moveEvaluation = moveEvaluations[moveIndex];

      if (isWhite && moveIndex % 2 === 0) {
        // Whites move
        if (
          moveEvaluation.difference < -centipawnMax &&
          moveEvaluation.difference > -centipawnMin
        ) {
          blunders.push(moveIndex);
        }
      }
      if (!isWhite && moveIndex % 2 === 1) {
        // Blacks move
        if (
          moveEvaluation.difference > centipawnMin &&
          moveEvaluation.difference < centipawnMax
        ) {
          blunders.push(moveIndex);
        }
      }
    }
    return blunders;
  }

  async evaluateGame(
    gameDto: GameDto,
    isWhite: boolean,
    listener: (evaluationStatus: EvaluationStatus) => void,
  ): Promise<GameAnalysis> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<GameAnalysis>(async (resolve) => {
      const stockfish = new Worker("/stockfish.js");

      let currentMove = 0;

      const moves = GameEvaluator.extractMovesFromPgn(gameDto.pgn);

      const moveEvaluations: Array<MoveEvaluation> = [];

      let previousScore = 0;

      stockfish.onmessage = (messageEvent: any) => {
        const data = messageEvent.data;

        if (
          data.startsWith(`info depth ${STOCKFISH_DEPTH}`) &&
          data.includes("score cp")
        ) {
          //isAnalysisComplete.value = true
          const scoreMatch = data.match(/score cp (-?\d+)/);
          if (scoreMatch) {
            const score =
              parseInt(scoreMatch[1], 10) * (currentMove % 2 === 0 ? 1 : -1);
            moveEvaluations.push({
              index: currentMove - 1,
              move: moves[currentMove - 1],
              score: score,
              difference: score - previousScore,
            });

            previousScore = score;
          }
        } else if (messageEvent.data.startsWith("Fen")) {
          let fen = data.replace("Fen ", "");
          fen = fen.substring(fen.indexOf(" ") + 1);

          if (moveEvaluations.length > 0) {
            const moveAnalysis = moveEvaluations[moveEvaluations.length - 1];
            moveAnalysis.fen = fen;
            listener({
              currentMove: moveAnalysis.index,
              totalMoves: moves.length,
            });
          }

          currentMove++;
          if (currentMove < moves.length - 1) {
            analyseNextMove();
          } else {
            stockfish.postMessage("quit");
            stockfish.terminate();
            listener({ currentMove: moves.length, totalMoves: moves.length });

            const gameAnalysis: GameAnalysis = {
              isWhite: isWhite,
              endInfo: {
                status: GameEvaluator.getEndStatus(gameDto, isWhite),
              },
              totalMoves: moveEvaluations.length,
              inaccuracies: GameEvaluator.findScoreChanges(
                isWhite,
                moveEvaluations,
                20,
                50,
              ),
              mistakes: GameEvaluator.findScoreChanges(
                isWhite,
                moveEvaluations,
                50,
                150,
              ),
              blunders: GameEvaluator.findScoreChanges(
                isWhite,
                moveEvaluations,
                150,
                Number.MAX_VALUE,
              ),
              midgameStart: 14,
              endgameStart: 40,
            };

            resolve(gameAnalysis);
          }
        }
      };

      stockfish.postMessage("uci"); // Initializes the UCI protocol
      stockfish.postMessage("ucinewgame");
      stockfish.postMessage("isready"); // Ensures the engine is ready

      stockfish.postMessage("d");

      await analyseNextMove();

      async function analyseNextMove() {
        stockfish.postMessage(
          GameEvaluator.getStockfishMoveCommand(moves, currentMove + 1),
        ); // Set starting position

        // Start evaluation after each move
        stockfish.postMessage(`go depth ${STOCKFISH_DEPTH}`); // You can adjust depth as needed
        stockfish.postMessage("d");
      }
    });
  }
}

export default new GameEvaluator();
