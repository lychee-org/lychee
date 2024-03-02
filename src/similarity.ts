type Tag = string;

const parseTags = (s: string): Tag[][] =>
  s.split('/').map((move) => move.split(' '));

// export const tagDistance = (a: Tag, b: Tag): number => {
//     if (a === b) {
//         return 0;
//     }
//     const aSplit = a.split(":");
//     const bSplit = b.split(":");
//     if (aSplit.length === 0 && bSplit.length === 0) {
//         return 0;
//     }
//     if (aSplit.length === 0 || bSplit.length === 0) {
//         return 1;
//     }
//     if (aSplit[0] !== bSplit[0]) {
//         return 1;
//     }
//     return tagDistance(aSplit.slice(1).join(":"), bSplit.slice(1).join(":")) / 2;
// }

export const tagDistance = (a: Tag, b: Tag): number => {
  const aSplit = a.split(':');
  const bSplit = b.split(':');
  const minLength = Math.min(aSplit.length, bSplit.length);
  let count: number = 0;
  for (let i = 0; i < minLength; i++) {
    if (aSplit[i] != bSplit[i]) {
      return 1 / 2 ** i;
    }
    count += 1;
  }
  if (aSplit.length == bSplit.length) {
    return 0;
  }
  return 1 / 2 ** count;
};

// const tagListDistance = (a: Tag[], b: Tag[]): number => {
//     if (a.length === 0) {
//         return b.length;
//     }
//     if (b.length === 0) {
//         return a.length;
//     }
//     return Math.min(
//         tagDistance(a[0], b[0]) + tagListDistance(a.slice(1), b.slice(1)),
//         1 + tagListDistance(a.slice(1), b),
//         1 + tagListDistance(a, b.slice(1))
//     );
// }

export const tagListDistanceDP = (a: Tag[], b: Tag[]): number => {
  // Create a n x m DP table
  a.sort();
  b.sort();
  const rows = a.length;
  const columns = b.length;
  const table: number[][] = new Array(rows + 1)
    .fill(null)
    .map(() => new Array(columns + 1).fill(0));

  // Initialize value for ([empty], [..., .....]) and ([..., .....], [empty])
  for (let i = 0; i < rows + 1; i++) {
    table[i][0] = i;
  }
  for (let j = 0; j < columns + 1; j++) {
    table[0][j] = j;
  }

  // DP
  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < columns + 1; j++) {
      const distance = tagDistance(a[i - 1], b[j - 1]);
      table[i][j] = Math.min(
        distance + table[i - 1][j - 1],
        1 + table[i][j - 1],
        1 + table[i - 1][j]
      );
    }
  }

  return table[rows][columns];
};

const unorderedDistance = (a: Tag[][], b: Tag[][]): number =>
  tagListDistanceDP(
    Array.from(new Set(a.flat())).sort(),
    Array.from(new Set(b.flat())).sort()
  );

// const orderedDistance = (a: Tag[][], b: Tag[][]): number => {
//     if (a.length === 0) {
//         return b.flat().length;
//     }
//     if (b.length === 0) {
//         return a.flat().length;
//     }
//     return Math.min(
//         tagListDistance(a[0], b[0]) + orderedDistance(a.slice(1), b.slice(1)),
//         a[0].length + orderedDistance(a.slice(1), b),
//         b[0].length + orderedDistance(a, b.slice(1))
//     );
// }

export const orderedDistanceDP = (a: Tag[][], b: Tag[][]): number => {
  // Create a n x m DP table
  const rows = a.length;
  const columns = b.length;
  const table: number[][] = new Array(rows + 1)
    .fill(null)
    .map(() => new Array(columns + 1).fill(0));

  // Initialize value for [0, ...] and [..., 0]
  for (let i = 0; i <= rows; i++) {
    table[i][0] = a.slice(0, i).flat().length;
  }
  for (let j = 0; j <= columns; j++) {
    table[0][j] = b.slice(0, j).flat().length;
  }

  // DP
  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < columns + 1; j++) {
      const distance = tagListDistanceDP(a[i - 1], b[j - 1]);
      table[i][j] = Math.min(
        distance + table[i - 1][j - 1],
        a[i - 1].length + table[i - 1][j],
        b[j - 1].length + table[i][j - 1]
      );
    }
  }
  return table[rows][columns];
};

const distanceTags = (a: Tag[][], b: Tag[][]): number =>
  unorderedDistance(a, b) + orderedDistanceDP(a.slice(0, -1), b.slice(0, -1));

const similarity_distance = (s1: string, s2: string): number =>
  distanceTags(parseTags(s1), parseTags(s2));

export default similarity_distance;
