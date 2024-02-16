import RatingCalculator from '../rating/RatingCalculator';
import GameResult from '../rating/GameResult';
import Rating from '../rating/GlickoV2Rating';

const INT_EPSILON = -0.5;

// Use default Glicko hyperparameters.
const tau: number = 0.75;
const ratingPeriodsPerDay: number = 0.21436;
const calculator: RatingCalculator = new RatingCalculator(
  tau,
  ratingPeriodsPerDay
);

const glicko = (
  rating: number,
  deviation: number,
  volatility: number
): Rating => new Rating(rating, deviation, volatility, 0);

describe('Testing Glicko rating calculation', () => {
  test('Two default deviations, same rating', () => {
    const r1: Rating = glicko(1500.0, 500.0, 0.09);
    const r2: Rating = glicko(1500.0, 500.0, 0.09);

    calculator.updateRatings(new GameResult(r1, r2));

    expect(r1.rating).toBeCloseTo(1741, INT_EPSILON);
    expect(r2.rating).toBeCloseTo(1258, INT_EPSILON);

    expect(r1.ratingDeviation).toBeCloseTo(396, INT_EPSILON);
    expect(r2.ratingDeviation).toBeCloseTo(396, INT_EPSILON);

    expect(r1.volatility).toBeCloseTo(0.0899983, 4);
    expect(r2.volatility).toBeCloseTo(0.0899983, 4);

    expect(r1.numberOfResults).toBe(1);
    expect(r2.numberOfResults).toBe(1);
  });

  test('Two low deviations, same ratings', () => {
    const r1: Rating = glicko(1500.0, 80, 0.06);
    const r2: Rating = glicko(1500.0, 80, 0.06);

    calculator.updateRatings(new GameResult(r1, r2));

    expect(r1.rating).toBeCloseTo(1517, INT_EPSILON);
    expect(r2.rating).toBeCloseTo(1482, INT_EPSILON);

    expect(r1.ratingDeviation).toBeCloseTo(78, INT_EPSILON);
    expect(r2.ratingDeviation).toBeCloseTo(78, INT_EPSILON);

    expect(r1.volatility).toBeCloseTo(0.06, 3);
    expect(r2.volatility).toBeCloseTo(0.06, 3);

    expect(r1.numberOfResults).toBe(1);
    expect(r2.numberOfResults).toBe(1);
  });

  test('Slightly different ratings and deviations', () => {
    const r1: Rating = glicko(1400, 79, 0.06);
    const r2: Rating = glicko(1550, 110, 0.065);

    calculator.updateRatings(new GameResult(r1, r2));

    expect(r1.rating).toBeCloseTo(1422, INT_EPSILON);
    expect(r2.rating).toBeCloseTo(1506, INT_EPSILON);

    expect(r1.ratingDeviation).toBeCloseTo(77, INT_EPSILON);
    expect(r2.ratingDeviation).toBeCloseTo(105, INT_EPSILON);

    expect(r1.volatility).toBeCloseTo(0.06, 3);
    expect(r2.volatility).toBeCloseTo(0.065, 3);

    expect(r1.numberOfResults).toBe(1);
    expect(r2.numberOfResults).toBe(1);
  });

  // TODO(sm3421): Work out why this test is worse than others, then reduce epsilon.
  test('Greatly different ratings and deviations - lower wins', () => {
    const r1: Rating = glicko(1200, 60, 0.053);
    const r2: Rating = glicko(1850, 200, 0.062);

    calculator.updateRatings(new GameResult(r1, r2));

    expect(r1.rating).toBeCloseTo(1216.7, INT_EPSILON);
    expect(r2.rating).toBeCloseTo(1636, INT_EPSILON);

    expect(r1.ratingDeviation).toBeCloseTo(59.9, INT_EPSILON);
    expect(r2.ratingDeviation).toBeCloseTo(196.9, INT_EPSILON);

    expect(r1.volatility).toBeCloseTo(0.053013, 5);
    expect(r2.volatility).toBeCloseTo(0.062028, 5);
  });

  test('Greatly different ratings and deviations - higher wins', () => {
    const r1: Rating = glicko(1200, 60, 0.053);
    const r2: Rating = glicko(1850, 200, 0.062);

    calculator.updateRatings(new GameResult(r2, r1));

    expect(r1.rating).toBeCloseTo(1199.3, INT_EPSILON);
    expect(r2.rating).toBeCloseTo(1855.4, INT_EPSILON);

    expect(r1.ratingDeviation).toBeCloseTo(59.9, INT_EPSILON);
    expect(r2.ratingDeviation).toBeCloseTo(196.9, INT_EPSILON);

    expect(r1.volatility).toBeCloseTo(0.052999, 5);
    expect(r2.volatility).toBeCloseTo(0.061999, 5);
  });
});
