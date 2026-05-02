export function findNextStep(
  grid: number[][],
  fromCol: number,
  fromRow: number,
  toCol: number,
  toRow: number,
): { col: number; row: number } | null {
  if (fromCol === toCol && fromRow === toRow) return null;

  const rows = grid.length;
  if (rows === 0) return null;
  const cols = grid[0].length;
  if (cols === 0) return null;

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array<boolean>(cols).fill(false),
  );
  const prev: ([number, number] | null)[][] = Array.from({ length: rows }, () =>
    new Array<[number, number] | null>(cols).fill(null),
  );

  const DIRS: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const queue: [number, number][] = [[fromCol, fromRow]];
  visited[fromRow][fromCol] = true;

  while (queue.length > 0) {
    const [col, row] = queue.shift()!;

    if (col === toCol && row === toRow) {
      // Walk the prev chain back until the parent is the start cell.
      let curCol = toCol;
      let curRow = toRow;
      while (true) {
        const p = prev[curRow][curCol];
        if (p === null || (p[0] === fromCol && p[1] === fromRow)) {
          return { col: curCol, row: curRow };
        }
        curCol = p[0];
        curRow = p[1];
      }
    }

    for (const [dc, dr] of DIRS) {
      const nc = col + dc;
      const nr = row + dr;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1 || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      prev[nr][nc] = [col, row];
      queue.push([nc, nr]);
    }
  }

  return null;
}
