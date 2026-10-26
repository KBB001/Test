export type ReviewRating = 0 | 1 | 2 | 3; // 0: Forgot/Again, 1: Hard, 2: Good, 3: Easy

export interface SpacedRepetitionInput {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

export interface SpacedRepetitionOutput {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  isMastered: boolean;
}

/**
 * Calculates next review interval using SuperMemo SM-2 algorithm adaptation
 */
export function calculateNextReview(
  input: SpacedRepetitionInput,
  rating: ReviewRating,
  baseDate: Date = new Date()
): SpacedRepetitionOutput {
  let { repetitions, intervalDays, easeFactor } = input;
  
  if (rating === 0) {
    // Reset streak on failure
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Rating 1 (Hard), 2 (Good), 3 (Easy)
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = rating === 1 ? 3 : 6;
    } else {
      const modifier = rating === 1 ? 1.2 : rating === 2 ? easeFactor : easeFactor * 1.3;
      intervalDays = Math.round(intervalDays * modifier);
    }
    repetitions += 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Where q is quality scale from 2 (Hard) to 5 (Easy)
  const quality = rating === 0 ? 0 : rating === 1 ? 3 : rating === 2 ? 4 : 5;
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 2.8) easeFactor = 2.8;

  const nextDate = new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const isMastered = repetitions >= 5 && intervalDays >= 21;

  return {
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewDate: nextDate.toISOString(),
    isMastered,
  };
}

/**
 * Filter cards that are due for review
 */
export function isCardDueForReview(nextReviewDateStr: string, currentDate: Date = new Date()): boolean {
  if (!nextReviewDateStr) return true;
  const reviewDate = new Date(nextReviewDateStr);
  return currentDate.getTime() >= reviewDate.getTime();
}
