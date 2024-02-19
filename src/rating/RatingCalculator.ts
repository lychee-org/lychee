import GameResult from './GameResult';
import Rating from './GlickoV2Rating';

const CONVERGENCE_TOLERANCE: number = 0.000001;
const ITERATION_MAX: number = 1000;

// TODO(sm3421): https://github.com/lichess-org/lila/blob/master/modules/puzzle/src/main/PuzzleFinisher.scala#L200.
export default class RatingCalculator {
  constructor(private tau: number = 0.75) {}

  updateRatings(
    result: GameResult,
    skipDeviationIncrease: boolean = false
  ): void {
    const players: Rating[] = result.players();
    players.forEach((player) => {
      this.calculateNewRating(player, [result], skipDeviationIncrease ? 0 : 1);
    });
    players.forEach((player) => player.finaliseRating());
  }

  private calculateNewRating(
    player: Rating,
    results: GameResult[],
    elapsedRatingPeriods: number
  ): void {
    const phi = player.getGlicko2RatingDeviation();
    const sigma = player.volatility;
    const a = Math.log(Math.pow(sigma, 2));
    const delta = this.deltaOf(player, results);
    const v = this.vOf(player, results);

    let A = a;
    let B = 0;

    if (Math.pow(delta, 2) > Math.pow(phi, 2) + v) {
      B = Math.log(Math.pow(delta, 2) - Math.pow(phi, 2) - v);
    } else {
      let k = 1;
      B = a - k * Math.abs(this.tau);
      while (this.f(B, delta, phi, v, a, this.tau) < 0) {
        k++;
        B = a - k * Math.abs(this.tau);
      }
    }

    let fA = this.f(A, delta, phi, v, a, this.tau);
    let fB = this.f(B, delta, phi, v, a, this.tau);

    let iterations = 0;
    while (
      Math.abs(B - A) > CONVERGENCE_TOLERANCE &&
      iterations < ITERATION_MAX
    ) {
      iterations++;
      const C = A + ((A - B) * fA) / (fB - fA);
      const fC = this.f(C, delta, phi, v, a, this.tau);

      if (fC * fB <= 0) {
        A = B;
        fA = fB;
      } else {
        fA = fA / 2.0;
      }

      B = C;
      fB = fC;
    }

    if (iterations === ITERATION_MAX) {
      console.log(`Convergence fail at ${iterations} iterations!`);
      throw new Error('Convergence fail');
    }

    const newSigma = Math.exp(A / 2.0);
    player.workingVolatility = newSigma;

    const phiStar = this.calculateNewRD(phi, newSigma, elapsedRatingPeriods);
    const newPhi = 1.0 / Math.sqrt(1.0 / Math.pow(phiStar, 2) + 1.0 / v);
    player.workingRating =
      player.getGlicko2Rating() +
      Math.pow(newPhi, 2) * this.outcomeBasedRating(player, results);
    player.workingRatingDeviation = newPhi;
    player.incrementNumberOfResults(results.length);
  }

  private f(
    x: number,
    delta: number,
    phi: number,
    v: number,
    a: number,
    tau: number
  ): number {
    return (
      (Math.exp(x) *
        (Math.pow(delta, 2) - Math.pow(phi, 2) - v - Math.exp(x))) /
        (2.0 * Math.pow(Math.pow(phi, 2) + v + Math.exp(x), 2)) -
      (x - a) / Math.pow(tau, 2)
    );
  }

  private g(deviation: number): number {
    return (
      1.0 /
      Math.sqrt(1.0 + (3.0 * Math.pow(deviation, 2)) / Math.pow(Math.PI, 2))
    );
  }

  private E(
    playerRating: number,
    opponentRating: number,
    opponentDeviation: number
  ): number {
    return (
      1.0 /
      (1.0 +
        Math.exp(
          -1.0 * this.g(opponentDeviation) * (playerRating - opponentRating)
        ))
    );
  }

  private vOf(player: Rating, results: GameResult[]): number {
    let v = 0.0;
    results.forEach((result) => {
      v +=
        Math.pow(
          this.g(result.getOpponent(player).getGlicko2RatingDeviation()),
          2
        ) *
        this.E(
          player.getGlicko2Rating(),
          result.getOpponent(player).getGlicko2Rating(),
          result.getOpponent(player).getGlicko2RatingDeviation()
        ) *
        (1.0 -
          this.E(
            player.getGlicko2Rating(),
            result.getOpponent(player).getGlicko2Rating(),
            result.getOpponent(player).getGlicko2RatingDeviation()
          ));
    });
    return 1 / v;
  }

  private deltaOf(player: Rating, results: GameResult[]): number {
    return this.vOf(player, results) * this.outcomeBasedRating(player, results);
  }

  private outcomeBasedRating(player: Rating, results: GameResult[]): number {
    let outcomeBasedRating = 0;
    results.forEach((result) => {
      outcomeBasedRating +=
        this.g(result.getOpponent(player).getGlicko2RatingDeviation()) *
        (result.getScore(player) -
          this.E(
            player.getGlicko2Rating(),
            result.getOpponent(player).getGlicko2Rating(),
            result.getOpponent(player).getGlicko2RatingDeviation()
          ));
    });
    return outcomeBasedRating;
  }

  private calculateNewRD(
    phi: number,
    sigma: number,
    elapsedRatingPeriods: number
  ): number {
    return Math.sqrt(
      Math.pow(phi, 2) + elapsedRatingPeriods * Math.pow(sigma, 2)
    );
  }
}
