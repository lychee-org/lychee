import similarity_distance from '../src/similarity';

describe('Testing similarity distance algorithm porting', () => {
  // TODO(sm3421): Remove duplicates.
  test('Correcly ported', () => {
    expect(
      similarity_distance('fork:n//crushing short', '/fork:q/crushing short')
    ).toBe(2.5);
    expect(
      similarity_distance('/fork:r//crushing long', 'fork:n///crushing long')
    ).toBe(2.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:q//advantage short')
    ).toBe(2.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:q//advantage short')
    ).toBe(2.5);
    expect(
      similarity_distance(
        'pin:preventsAttack:q//advantage short',
        '/pin:preventsAttack:r pin:preventsEscape:r/advantage short'
      )
    ).toBe(3.25);
    expect(
      similarity_distance('/fork:q/crushing short', 'fork:p//advantage short')
    ).toBe(3.5);
    expect(
      similarity_distance('fork:n///crushing long', '/fork:q/crushing short')
    ).toBe(3.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:q//crushing short')
    ).toBe(3.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:n//crushing short')
    ).toBe(3.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:n//crushing short')
    ).toBe(3.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:n//crushing short')
    ).toBe(3.5);
    expect(
      similarity_distance(
        '/pin:preventsAttack:q/crushing kingsideAttack short',
        '/pin:preventsAttack:r pin:preventsEscape:r/advantage short'
      )
    ).toBe(3.75);
    expect(
      similarity_distance(
        '/fork:r//crushing long',
        'fork:p////advantage veryLong'
      )
    ).toBe(4.5);
    expect(
      similarity_distance(
        '/defensiveMove:k/advantage short',
        'defensiveMove:b////advantage veryLong'
      )
    ).toBe(4.5);
    expect(
      similarity_distance('/fork:p/advantage short', 'fork:n///crushing long')
    ).toBe(4.5);
    expect(
      similarity_distance(
        '/pin:preventsAttack:q//advantage long',
        '/pin:preventsAttack:r pin:preventsEscape:r/advantage short'
      )
    ).toBe(4.75);
    expect(similarity_distance('//advantage short', '//crushing short')).toBe(
      1
    );
    expect(
      similarity_distance(
        '//backRankMate mate mateIn2 short',
        '//mate mateIn2 short'
      )
    ).toBe(1);
    expect(similarity_distance('//crushing short', '//advantage short')).toBe(
      1
    );
    expect(
      similarity_distance('fork:n//crushing short', 'fork:q//crushing short')
    ).toBe(1.0);
    expect(similarity_distance('//crushing short', '//advantage short')).toBe(
      1
    );
    expect(
      similarity_distance('///crushing long rEndgame', '//advantage short')
    ).toBe(4);
    expect(
      similarity_distance(
        'pin:preventsAttack:q//advantage short',
        '/sacrifice:r/crushing short'
      )
    ).toBe(4);
    expect(
      similarity_distance(
        '/defensiveMove:k/advantage short',
        '/trappedPiece/crushing short'
      )
    ).toBe(4);
    expect(
      similarity_distance('////crushing veryLong', '//advantage short')
    ).toBe(4);
    expect(
      similarity_distance(
        '/sacrifice:r/////crushing veryLong',
        'defensiveMove:n////crushing veryLong'
      )
    ).toBe(4);
    expect(
      similarity_distance(
        '/defensiveMove:k/advantage short',
        '//advantage short'
      )
    ).toBe(2);
    expect(
      similarity_distance('fork:n//crushing short', '//advantage short')
    ).toBe(3);
    expect(
      similarity_distance('///deflection/crushing veryLong', '//crushing short')
    ).toBe(4);
    expect(
      similarity_distance(
        '//interference/advantage long',
        '/skewer:r/advantage short'
      )
    ).toBe(4);
    expect(
      similarity_distance('fork:n//crushing short', '/mate mateIn1 oneMove')
    ).toBe(4);
    expect(
      similarity_distance(
        '///crushing long rEndgame',
        'fork:p////advantage veryLong'
      )
    ).toBe(4);
    expect(
      similarity_distance(
        '//advantage short',
        '//backRankMate mate mateIn2 short'
      )
    ).toBe(3);
    expect(
      similarity_distance(
        '//backRankMate mate mateIn2 short',
        '//advantage rEndgame short'
      )
    ).toBe(3);
    expect(
      similarity_distance('/trappedPiece/crushing short', '//advantage short')
    ).toBe(3);
    expect(
      similarity_distance('/mate mateIn1 oneMove', '//mate mateIn2 short')
    ).toBe(3);
    expect(
      similarity_distance('/mate mateIn1 oneMove', '//crushing short')
    ).toBe(4);
    expect(
      similarity_distance('fork:q//advantage short', '//advantage short')
    ).toBe(2);
    expect(
      similarity_distance('//mate mateIn2 short', '//skewer:r/crushing long')
    ).toBe(4);
    expect(
      similarity_distance(
        'fork:q//advantage short',
        'hangingPiece//advantage short'
      )
    ).toBe(2);
    expect(
      similarity_distance('//mate mateIn2 short', 'fork:n//crushing short')
    ).toBe(3);
    expect(
      similarity_distance('//advantage short', '/fork:r//crushing long')
    ).toBe(4);
    expect(
      similarity_distance(
        '/pin:preventsAttack:q//advantage long',
        'fork:p////advantage veryLong'
      )
    ).toBe(4);
    expect(
      similarity_distance('///crushing long', '///deflection/crushing veryLong')
    ).toBe(3);
    expect(
      similarity_distance(
        '///crushing long rEndgame',
        'skewer:r/exposedKing//crushing long rEndgame'
      )
    ).toBe(4);
    expect(
      similarity_distance('//mate mateIn2 short', '//advantage short')
    ).toBe(2);
    expect(
      similarity_distance('/fork:r//crushing long', 'fork:q//advantage short')
    ).toBe(4.0);
    expect(
      similarity_distance('//advantage short', 'hangingPiece//advantage short')
    ).toBe(2);
    expect(
      similarity_distance(
        '///crushing long',
        '/discoveredAttack/crushing short'
      )
    ).toBe(4);
    expect(
      similarity_distance(
        '/deflection/crushing short',
        '///crushing long pEndgame'
      )
    ).toBe(4);
    expect(
      similarity_distance('hangingPiece//advantage short', '//crushing short')
    ).toBe(3);
    expect(
      similarity_distance('fork:n//crushing short', '//crushing short')
    ).toBe(2);
    expect(
      similarity_distance(
        '/discoveredAttack/crushing short',
        '//advantage short'
      )
    ).toBe(3);
    expect(
      similarity_distance('/sacrifice:r/crushing short', '//advantage short')
    ).toBe(3);
    expect(
      similarity_distance('fork:q//advantage short', '//advantage short')
    ).toBe(2);
  });
});
