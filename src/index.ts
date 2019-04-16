import Game from "./Game";
import Logger from "./util/Logger";

class MazeGame {
  private _game: Game;

  constructor() {
    Logger.info("MazeGame v1.0.0 initialized.");

    const startScreen = document.getElementById("start-screen");
    startScreen.getElementsByTagName("button")[0].addEventListener("click", () => {
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("timer").style.display = "inline";
      document.getElementById("level").style.display="inline";
      document.getElementById("levelNum").style.display="inline";
      document.getElementById("score").style.display="inline";
      this._game = new Game();
    });
  }
}

new MazeGame();