type GameResultsCodes =
  | "win"
  | "loss"
  | "checkmated"
  | "abandoned"
  | "agreed"
  | "repetition"
  | "timeout"
  | "resigned"
  | "stalemate"
  | "lose"
  | "insufficient"
  | "50move"
  | "kingofthehill"
  | "threecheck"
  | "timevsinsufficient"
  | "bughousepartnerlose";

type PlayerInfo = {
  username: string;
  result: GameResultsCodes;
  rating: number;
  uuid: string;
};

interface GameDto {
  url: string;
  uuid: string;
  pgn: string;
  fen: string;
  white: PlayerInfo;
  black: PlayerInfo;
  time_control: string;
  time_class: string;
  rated: boolean;
  eco: string;
  accuracies: { white: number; black: number };
  initial_setup: string;
  rules: string;
  tcn: string;
}

export type { PlayerInfo };
export default GameDto;
