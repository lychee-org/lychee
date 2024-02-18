import { calculateSm2 } from '../app/api/puzzle/nextPuzzle/sm2';

// Adapted from https://github.com/thyagoluciano/sm2/blob/master/test/sm2_test.dart.
describe('Testing sm2 algorithm implementation', () => {
  test('Calc success', () => {
    const { interval, repetitions, easeFactor } = calculateSm2(0, 0, 0, 2.5);
    expect(interval).toBe(1);
    expect(repetitions).toBe(0);
    expect(easeFactor).toBe(2.5);
  });

  test('Calc - quality: 5, repetitions: 2, interval: 6, factor: 1.3', () => {
    const { interval, repetitions, easeFactor } = calculateSm2(5, 2, 6, 1.3);
    expect(interval).toBe(8);
    expect(repetitions).toBe(3);
    expect(easeFactor).toBe(1.4000000000000001);
  });
});
