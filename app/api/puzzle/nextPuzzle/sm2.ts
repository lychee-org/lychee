import Rating from '@/rating/GlickoV2Rating';

type SmResponse = {
  interval: number;
  repetitions: number;
  easeFactor: number;
};

// Adapted from https://github.com/thyagoluciano/sm2/blob/master/lib/sm.dart.
// export for the sake of testing.
export const calculateSm2 = (
  quality: number,
  repetitionsOriginal: number,
  previousInterval: number,
  previousEaseFactor: number
): SmResponse => {
  let interval: number = 0;
  let easeFactor: number = 0;
  let repetitions: number = repetitionsOriginal;

  if (quality >= 3) {
    switch (repetitions) {
      case 0:
        interval = 1;
        break;
      case 1:
        interval = 6;
        break;
      default:
        interval = Math.round(previousInterval * previousEaseFactor);
    }

    repetitions += 1;
    easeFactor =
      previousEaseFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    repetitions = 0;
    interval = 1;
    easeFactor = previousEaseFactor;
  }

  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return { interval, repetitions, easeFactor };
};

const applySm2 = (elos: Map<string, Rating>): Map<string, number> => {
  const ratings = Array.from(elos.values(), (r) => r.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);

  const result = new Map<string, number>();
  elos.forEach((v, k) => {
    const r = v.rating;
    const nb = v.numberOfResults;
    const normalised = Math.round(((r - min) / (max - min)) * 5);
    result.set(k, 9 - calculateSm2(normalised, nb, 3, 2.5).interval);
  });
  return result;
};

const proportionallyRandomTheme = (elos: Map<string, number>): string => {
  const total = Array.from(elos.values()).reduce((acc, curr) => acc + curr, 0);
  const random = Math.floor(Math.random() * total);
  let sum = 0;
  let ans: string | undefined = undefined;
  elos.forEach((v, k) => {
    if (ans) {
      return;
    }
    sum += v;
    if (sum > random) {
      ans = k;
    }
  });
  if (!ans) {
    throw new Error('No theme found');
  }
  return ans!;
};

const sm2RandomThemeFromRatingMap = (elos: Map<string, Rating>): string => {
  return proportionallyRandomTheme(applySm2(elos));
};

export default sm2RandomThemeFromRatingMap;
