/**
 * This function creates x, y, and z coordinates for a given maze map.
 * @param map - a valid maze map that uses -'s to denote space and *'s to denote blocks.
 * | is used to denote row splits.
 */
export function create(map) {
  const rows = map.split("|");
  const coordinates = [];
  for (let i = 0; i < rows.length; i++) {
    // x coordinate is the column.
    // y coordinate is always 1.
    // z coordinate is the row.
    for (let j = 0; j < rows[i].length; j++) {
      const row = rows[i];
      if (row[j] === "*") {
        coordinates.push([Math.ceil(row.length / 2) - (j + 1), 1, i]);
      }
    }
  }
  return coordinates;
}

export const ONE = "----***----|" +
                   "-----*-----|" +
                   "----**-----|" +
                   "----*------|" +
                   "----**-----|" +
                   "-----*-----";