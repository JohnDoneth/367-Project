export default class Cell {
  private readonly _col: number;
  private readonly _row: number;
  private readonly _width: number;
  private readonly _height: number;

  constructor(col: number, row: number, width: number, height: number) {
    this._col = col;
    this._row = row;
    this._width = width;
    this._height = height;
  }

  get col(): number {
    return this._col;
  }

  get row(): number {
    return this._row;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }
}