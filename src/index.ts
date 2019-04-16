import Game from "./Game";
import Logger from "./util/Logger";

class MazeGame {
  private _game: Game;
  private _ballTrail : boolean;

  constructor() {
    this._ballTrail = true;
    Logger.info("MazeGame v1.0.0 initialized.");
    document.getElementById("hint").style.display="none";

    const startScreen = document.getElementById("start-screen");
    document.getElementById("ballTrail").addEventListener("click", () =>{
        this._ballTrail = !this._ballTrail;
        if (this._ballTrail)
          document.getElementById("ballTrail").innerHTML = "Ball trail enabled";
        else
          document.getElementById("ballTrail").innerHTML = "Ball trail disabled";
    });
    document.getElementById("playButton").addEventListener("click", () => {
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("timer").style.display = "inline";
      document.getElementById("level").style.display="inline";
      document.getElementById("score").style.display="inline";
      this._game = new Game(false, this._ballTrail);
    });
    document.getElementById("nightMode").addEventListener("click", () => {
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("timer").style.display = "inline";
      document.getElementById("level").style.display="inline";
      document.getElementById("hint").style.display="inline";
      document.getElementById("score").style.display="inline";
      this._game = new Game(true, this._ballTrail);
    });
  }
}

new MazeGame();