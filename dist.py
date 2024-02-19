from typing import List, Union, Tuple

Tag = str


def parse_tags(s: str) -> List[List[Tag]]:
    movetags = s.split("/")
    movetags = [move.split(" ") for move in movetags]
    return movetags


def tag_distance(a: Tag, b: Tag) -> float:
    if a == b:
        return 0
    a = a.split(":")
    b = b.split(":")
    if len(a) == 0 and len(b) == 0:
        return 0
    if len(a) == 0 or len(b) == 0:
        return 1
    if a[0] != b[0]:
        return 1
    return tag_distance(":".join(a[1:]), ":".join(b[1:])) / 2


def taglist_distance(a: List[Tag], b: List[Tag]) -> float:
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)
    return min(
        tag_distance(a[0], b[0]) + taglist_distance(a[1:], b[1:]),
        1 + taglist_distance(a[1:], b),
        1 + taglist_distance(a, b[1:]),
    )


def unordered_distance(a: List[List[Tag]], b: List[List[Tag]]) -> float:
    a = sorted(list(set(sum(a, [])))) # "Set" here is to remove duplicates.
    b = sorted(list(set(sum(b, []))))
    return taglist_distance(a, b)


def ordered_distance(a: List[List[Tag]], b: List[List[Tag]]) -> float:
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)
    return min(
        taglist_distance(a[0], b[0]) + ordered_distance(a[1:], b[1:]),
        1 + ordered_distance(a[1:], b),
        1 + ordered_distance(a, b[1:]),
    )


def distance_tags(a: List[List[Tag]], b: List[List[Tag]]) -> float:
    return unordered_distance(a, b) + ordered_distance(a[:-1], b[:-1])


def distance(s1: str, s2: str) -> float:
    return distance_tags(parse_tags(s1), parse_tags(s2))


assert(distance("/fork:q/crushing short", "fork:b//crushing short") == 2.5)
assert(distance("fork:n//crushing short", "/fork:q/crushing short") == 2.5)
assert(distance("fork:n//crushing short", "/fork:q/crushing short") == 2.5)
assert(distance("fork:n//crushing short", "/fork:q/crushing short") == 2.5)
assert(distance("/fork:r//crushing long", "fork:n///crushing long") == 2.5)
assert(distance("/fork:p/advantage short", "fork:q//advantage short") == 2.5)
assert(distance("/fork:p/advantage short", "fork:q//advantage short") == 2.5)
assert(distance("/fork:p/advantage short", "fork:q//advantage short") == 2.5)
assert(distance("/fork:p/advantage short", "fork:q//advantage short") == 2.5)
assert(distance("pin:preventsAttack:q//advantage short", "/pin:preventsAttack:r pin:preventsEscape:r/advantage short") == 3.25)
assert(distance("/fork:q/crushing short", "fork:p//advantage short") == 3.5)
assert(distance("fork:n///crushing long", "/fork:q/crushing short") == 3.5)
assert(distance("/fork:p/advantage short", "fork:b//crushing short") == 3.5)
assert(distance("/fork:p/advantage short", "fork:q//crushing short") == 3.5)
assert(distance("/fork:p/advantage short", "fork:n//crushing short") == 3.5)
assert(distance("/fork:p/advantage short", "fork:n//crushing short") == 3.5)
assert(distance("/fork:p/advantage short", "fork:n//crushing short") == 3.5)
assert(distance("/pin:preventsAttack:q/crushing kingsideAttack short", "/pin:preventsAttack:r pin:preventsEscape:r/advantage short") == 3.75)
assert(distance("/fork:r//crushing long", "fork:p////advantage veryLong") == 4.5)
assert(distance("/defensiveMove:k/advantage short", "defensiveMove:b////advantage veryLong") == 4.5)
assert(distance("/fork:p/advantage short", "fork:n///crushing long") == 4.5)
assert(distance("/pin:preventsAttack:q//advantage long", "/pin:preventsAttack:r pin:preventsEscape:r/advantage short") == 4.75)
assert(distance("//advantage short", "//crushing short") == 1)
assert(distance("//backRankMate mate mateIn2 short", "//mate mateIn2 short") == 1)
assert(distance("//crushing short", "//advantage short") == 1)
assert(distance("fork:n//crushing short", "fork:q//crushing short") == 1.0)
assert(distance("//crushing short", "//advantage short") == 1)
assert(distance("///crushing long rEndgame", "//advantage short") == 4)
assert(distance("pin:preventsAttack:q//advantage short", "/sacrifice:r/crushing short") == 4)
assert(distance("/defensiveMove:k/advantage short", "/trappedPiece/crushing short") == 4)
assert(distance("////crushing veryLong", "//advantage short") == 4)
assert(distance("/sacrifice:r/////crushing veryLong", "defensiveMove:n////crushing veryLong") == 4)
assert(distance("/defensiveMove:k/advantage short", "//advantage short") == 2)
assert(distance("fork:n//crushing short", "//advantage short") == 3)
assert(distance("///deflection/crushing veryLong", "//crushing short") == 4)
assert(distance("//interference/advantage long", "/skewer:r/advantage short") == 4)
assert(distance("fork:n//crushing short", "/mate mateIn1 oneMove") == 4)
assert(distance("///crushing long rEndgame", "fork:p////advantage veryLong") == 4)
assert(distance("//advantage short", "//backRankMate mate mateIn2 short") == 3)
assert(distance("//backRankMate mate mateIn2 short", "//advantage rEndgame short") == 3)
assert(distance("/trappedPiece/crushing short", "//advantage short") == 3)
assert(distance("/mate mateIn1 oneMove", "//mate mateIn2 short") == 3)
assert(distance("/mate mateIn1 oneMove", "//crushing short") == 4)
assert(distance("fork:q//advantage short", "//advantage short") == 2)
assert(distance("//mate mateIn2 short", "//skewer:r/crushing long") == 4)
assert(distance("fork:q//advantage short", "hangingPiece//advantage short") == 2)
assert(distance("//mate mateIn2 short", "fork:n//crushing short") == 3)
assert(distance("//advantage short", "/fork:r//crushing long") == 4)
assert(distance("/pin:preventsAttack:q//advantage long", "fork:p////advantage veryLong") == 4)
assert(distance("///crushing long", "///deflection/crushing veryLong") == 3)
assert(distance("///crushing long rEndgame", "skewer:r/exposedKing//crushing long rEndgame") == 4)
assert(distance("//mate mateIn2 short", "//advantage short") == 2)
assert(distance("/fork:r//crushing long", "fork:q//advantage short") == 4.0)
assert(distance("//advantage short", "hangingPiece//advantage short") == 2)
assert(distance("///crushing long", "/discoveredAttack/crushing short") == 4)
assert(distance("/deflection/crushing short", "///crushing long pEndgame") == 4)
assert(distance("hangingPiece//advantage short", "//crushing short") == 3)
assert(distance("fork:n//crushing short", "//crushing short") == 2)
assert(distance("/discoveredAttack/crushing short", "//advantage short") == 3)
assert(distance("/sacrifice:r/crushing short", "//advantage short") == 3)
assert(distance("fork:q//advantage short", "/mate mateIn1 oneMove") == 4)
assert(distance("//advantage short", "discoveredCheck:q//crushing short") == 3)
assert(distance("/skewer:q/advantage short", "/mate mateIn1 oneMove") == 4)
assert(distance("hangingPiece//advantage short", "//backRankMate mate mateIn2 short") == 4)
assert(distance("/pin:preventsAttack:q//advantage long", "//advantage short") == 3)
assert(distance("fork:q//advantage short", "//advantage rEndgame short") == 2)
assert(distance("////crushing veryLong", "///long mate mateIn3") == 4)
assert(distance("/fork:q/crushing short", "//crushing short") == 2)
assert(distance("hangingPiece//advantage short", "//crushing short") == 3)
assert(distance("//advantage short", "fork:b//crushing short") == 3)
assert(distance("///crushing long rEndgame", "//advantage short") == 4)
assert(distance("fork:n//crushing short", "fork:q/fork:q/advantage short") == 4.0)
assert(distance("///crushing long", "//advantage short") == 3)
assert(distance("fork:n///crushing long", "/trappedPiece/crushing short") == 4)
assert(distance("/discoveredAttack/crushing short", "//advantage short") == 3)
assert(distance("///crushing long", "//mate mateIn2 short") == 4)
assert(distance("fork:q//advantage short", "//advantage short") == 2)
