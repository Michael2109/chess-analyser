import GameDto from "../game-dto.ts";
import pgnParser from "pgn-parser";
import {Chess} from "chess.js";
import MoveEvaluation from "./move-evaluation.ts";
import GameEvaluation from "./game-evaluation.ts";


const STOCKFISH_DEPTH = 8

class GameEvaluator {


    static getStockfishMoveCommand(moves: Array<string>, moveNumber: number): string {
        return "position startpos moves " + moves.slice(0, moveNumber).join(" ")
    }

    static extractMovesFromPgn(pgn: string) {
        const [result] = pgnParser.parse(pgn);

        const chess = new Chess(); // Starts with the standard initial position

        const lanMoves: Array<string> = [];

        // Loop through each move in SAN
        for (const pgnMove of result.moves) {

            const sanMove = pgnMove.move
            // Apply the SAN move to the board
            const move = chess.move(sanMove);

            if (!move) {
                console.error(`Invalid move: ${sanMove}`);
                break;
            }

            // Convert to long algebraic notation (LAN)
            const lanMove = `${move.from}${move.to}${move.promotion || ''}`; // Include promotion if any
            lanMoves.push(lanMove);
        }

        return lanMoves;
    }

    async evaluateGame(gameDto: GameDto, isWhite: boolean, listener: (moveAnalysis: MoveEvaluation) => void): Promise<GameEvaluation> {

        return new Promise<GameEvaluation>(async (resolve) => {

            const stockfish = new Worker('/stockfish.js');

            let currentMove = 0;

            let moves = GameEvaluator.extractMovesFromPgn(gameDto.pgn)

            let moveEvaluations: Array<MoveEvaluation> = []

            let previousScore = 0

            stockfish.onmessage = (messageEvent: any) => {

                const data = messageEvent.data

                if (messageEvent.data.startsWith('bestmove')) {

                } else if (data.startsWith(`info depth ${STOCKFISH_DEPTH}`) && data.includes('score cp')) {
                    //isAnalysisComplete.value = true
                    const scoreMatch = data.match(/score cp (-?\d+)/);
                    if (scoreMatch) {
                        const score =  parseInt(scoreMatch[1], 10) * ((currentMove % 2 === 0) ? 1 : -1);
                        moveEvaluations.push({
                            index: currentMove-1,
                            move: moves[currentMove-1],
                            score: score,
                            difference: score - previousScore
                        });

                        previousScore = score;
                    }
                } else if (messageEvent.data.startsWith('Fen')) {
                    let fen = data.replace("Fen ", "");
                    fen = fen.substring(fen.indexOf(" ") + 1)

                    if (moveEvaluations.length > 0) {
                        const moveAnalysis = moveEvaluations[moveEvaluations.length - 1]
                        moveAnalysis.fen = fen
                        listener(moveAnalysis)
                    }

                    currentMove++;
                    if (currentMove < moves.length - 1) {
                        analyseNextMove()
                    } else {
                        stockfish.postMessage("quit");
                        stockfish.terminate()

                        resolve({
                                white: {
                                    username: gameDto.white.username
                                },
                                black: {
                                    username: gameDto.black.username
                                },
                                isWhite: isWhite,
                                timeControl: gameDto.time_control,
                                uuid: gameDto.uuid,
                                moveEvaluations: moveEvaluations,
                                url: gameDto.url,
                            }
                        )
                    }
                } else if (messageEvent.data === "readyok") {

                } else {
                }
            };

            stockfish.postMessage('uci'); // Initializes the UCI protocol
            stockfish.postMessage('ucinewgame');
            stockfish.postMessage('isready'); // Ensures the engine is ready

            stockfish.postMessage('d');

            await analyseNextMove()


            async function analyseNextMove() {

                stockfish.postMessage(GameEvaluator.getStockfishMoveCommand(moves, currentMove + 1)); // Set starting position

                // Start evaluation after each move
                stockfish.postMessage(`go depth ${STOCKFISH_DEPTH}`); // You can adjust depth as needed
                stockfish.postMessage('d');

            }

        })
    }
}

export default new GameEvaluator()