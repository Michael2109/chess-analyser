import GamesDto from "../games-dto.ts";
import axios, { AxiosResponse } from "axios";

class Chessdotcom {
  static async getUserGames(username: string): Promise<GamesDto> {
    const october = await axios.get<GamesDto>(
      `https://api.chess.com/pub/player/${username}/games/2024/10`,
    );
    const november = await axios.get<GamesDto>(
      `https://api.chess.com/pub/player/${username}/games/2024/11`,
    );
    const december = await axios.get<GamesDto>(
      `https://api.chess.com/pub/player/${username}/games/2024/12`,
    );

    return {
      games: [
        ...october.data.games,
        ...november.data.games,
        ...december.data.games,
      ],
    };
  }
}

export default Chessdotcom;
