import Rating from './GlickoV2Rating';

export default class GameResult {
  constructor(
    public winner: Rating,
    public loser: Rating
  ) {}

  players(): Rating[] {
    return [this.winner, this.loser];
  }

  participated(player: Rating): boolean {
    return player === this.winner || player === this.loser;
  }

  getScore(player: Rating): number {
    return this.winner === player ? 1.0 : 0.0;
  }

  getOpponent(player: Rating): Rating {
    return this.winner === player ? this.loser : this.winner;
  }
}
