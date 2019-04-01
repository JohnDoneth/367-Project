import Cell from "./Cell";

export default class Maze {
  private readonly _width: number;
  private readonly _height: number;
  private readonly _cellWidth: number;
  private readonly _cellHeight: number;
  private readonly _cells: Cell[];

  constructor(width: number, height: number, cellWidth: number, cellHeight: number) {
    this._width = width;
    this._height = height;
    this._cellWidth = cellWidth;
    this._cellHeight = cellHeight;
    this._cells = [];

    this.createCells();
  }

  private createCells() {
    let count = 0;
    for (let i = 0; i < this._height; i++) {
      for (let j = 0; j < this._width; j++) {
        this._cells.push(new Cell(count, j, i, this._cellWidth, this._cellHeight));
        count++;
      }
    }
  }

  private randomize() {

  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get cellWidth(): number {
    return this._cellWidth;
  }

  get cellHeight(): number {
    return this._cellHeight;
  }

  get cells(): Cell[] {
    return this._cells;
  }
}

export const MAZE_ONE = new Maze(3, 1, 5, 5);