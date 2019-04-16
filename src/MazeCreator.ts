import Maze from "./models/Maze";
import Cell from "./models/Cell";

const OIMO = require("oimo");

export interface IMazeResults {
  objects: IMazeObject[]; // Comes back as an array of positions
}

interface IMazeObject {
  walls: any[];
  position: any;
  cell: Cell;
}

class MazeCreator {
  private static _instance: MazeCreator;

  public static getInstance(): MazeCreator {
    if (typeof MazeCreator._instance === "undefined") {
      MazeCreator._instance = new MazeCreator();
    }
    return MazeCreator._instance;
  }

  private constructor() {}

  /**
   * This function creates x, y, and z coordinates for a given maze map.
   * @param maze - a valid maze map.
   * | is used to denote row splits.
   */
  public create(maze: Maze): IMazeResults {
    const objects: IMazeObject[] = [];
    let count = 0;
    for (let i = 0; i < maze.height; i++) {
      for (let j = 0; j < maze.width; j++) {
        const cell: Cell = maze.cells[count];
        const walls: any[] = [];
        if (cell.hasTopWall) {
          walls.push([
            new OIMO.Vec3(maze.cellWidth, 1, 0.1), // size
            new OIMO.Vec3((Math.ceil(maze.width / 2) - (j + 1)) * maze.cellWidth, 1, -(i * maze.cellHeight) - (maze.cellHeight / 2)) // position
          ]);
        }
        if (cell.hasRightWall) {
          walls.push([
            new OIMO.Vec3(0.1, 1, maze.cellHeight), // size
            new OIMO.Vec3((Math.ceil((maze.width / 2) - (j + 1)) * maze.cellWidth) + (maze.cellWidth / 2), 1, -(i * maze.cellHeight)) // position
          ]);
        }
        if (cell.hasBotWall) {
          walls.push([
            new OIMO.Vec3(maze.cellWidth, 1, 0.1), // size
            new OIMO.Vec3((Math.ceil(maze.width / 2) - (j + 1)) * maze.cellWidth, 1, -(i * maze.cellHeight) + (maze.cellHeight / 2)) // position
          ]);
        }
        if (cell.hasLeftWall) {
          walls.push([
            new OIMO.Vec3(0.1, 1, maze.cellHeight), // size
            new OIMO.Vec3((Math.ceil((maze.width / 2) - (j + 1)) * maze.cellWidth) - (maze.cellWidth / 2), 1, -(i * maze.cellHeight)) // position
          ]);
        }
        objects.push({position: new OIMO.Vec3(Math.ceil(maze.width / 2) - (j + 1), 1, i), walls, cell});
        count++
      }
    }
    return {objects};
  }
}

export default MazeCreator.getInstance();