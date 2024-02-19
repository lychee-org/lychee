type Tag = string;

const parseTags = (s: string): Tag[][] => 
    s.split("/").map(move => move.split(" "));

const tagDistance = (a: Tag, b: Tag): number => {
    if (a === b) {
        return 0;
    }
    const aSplit = a.split(":");
    const bSplit = b.split(":");
    if (aSplit.length === 0 && bSplit.length === 0) {
        return 0;
    }
    if (aSplit.length === 0 || bSplit.length === 0) {
        return 1;
    }
    if (aSplit[0] !== bSplit[0]) {
        return 1;
    }
    return tagDistance(aSplit.slice(1).join(":"), bSplit.slice(1).join(":")) / 2;
}

const tagListDistance = (a: Tag[], b: Tag[]): number => {
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }
    return Math.min(
        tagDistance(a[0], b[0]) + tagListDistance(a.slice(1), b.slice(1)),
        1 + tagListDistance(a.slice(1), b),
        1 + tagListDistance(a, b.slice(1))
    );
}

const unorderedDistance = (a: Tag[][], b: Tag[][]): number => 
    tagListDistance(Array.from(new Set(a.flat())).sort(), Array.from(new Set(b.flat())).sort());

const orderedDistance = (a: Tag[][], b: Tag[][]): number => {
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }
    return Math.min(
        tagListDistance(a[0], b[0]) + orderedDistance(a.slice(1), b.slice(1)),
        a[0].length + orderedDistance(a.slice(1), b),
        b[0].length + orderedDistance(a, b.slice(1))
    );
}

const distanceTags = (a: Tag[][], b: Tag[][]): number => {
    return unorderedDistance(a, b) + orderedDistance(a.slice(0, -1), b.slice(0, -1));
}

const similarity_distance = (s1: string, s2: string): number => {
    return distanceTags(parseTags(s1), parseTags(s2));
}

export default similarity_distance
