type Tag = string;

export const SENTINEL_DISTANCE = 1000000; // assumed to be > 2 * max distance

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
    if (aSplit.length === 0 || bSplit.length === 0 || aSplit[0] !== bSplit[0]) {
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
    {
        const aFlat = Array.from(new Set(a.flat())).sort();
        const bFlat = Array.from(new Set(b.flat())).sort();
        const dist = (() => {
            if (a.length === 0) {
                return b.length;
            }
            if (b.length === 0) {
                return a.length;
            }
            return Math.min(
                tagDistance(aFlat[0], bFlat[0]) + tagListDistance(aFlat.slice(1), bFlat.slice(1)),
                1 + tagListDistance(aFlat.slice(1), bFlat),
                1 + tagListDistance(aFlat, bFlat.slice(1))
            )
        })();
        if (dist === aFlat.length || dist === bFlat.length) return SENTINEL_DISTANCE;
        return dist;
    }
    

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

const distanceTags = (a: Tag[][], b: Tag[][], min_distance?: number): number => {
    const ud = unorderedDistance(a, b);
    if (ud > (min_distance ?? SENTINEL_DISTANCE) / 2) {
        return SENTINEL_DISTANCE;
    }
    return ud + orderedDistance(a.slice(0, -1), b.slice(0, -1));
}

const similarity_distance = (s1: string, s2: string, min_distance?: number): number => {
    return distanceTags(parseTags(s1), parseTags(s2), min_distance);
}

export default similarity_distance
