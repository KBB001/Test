import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVocabularyCandidates, calculateProficiencyScore } from './language.ts';
import { calculateNextReview, isCardDueForReview } from './spacedRepetition.ts';
import { evaluateUnlockedStamps, calculateGlobalRank, generatePassportNumber } from './passport.ts';

test('language utils: extractVocabularyCandidates cleans punctuation and extracts tokens', () => {
  const text = 'Bonjour, mon cher ami! Comment allez-vous aujourd\'hui?';
  const candidates = extractVocabularyCandidates(text);
  assert.ok(candidates.includes('bonjour'));
  assert.ok(candidates.includes('comment'));
  // Should not contain small words <= 3 chars
  assert.ok(!candidates.includes('mon'));
});

test('language utils: calculateProficiencyScore determines correct CEFR level', () => {
  const resultA1 = calculateProficiencyScore(50, 2);
  assert.equal(resultA1.level, 'A1');

  const resultB1 = calculateProficiencyScore(400, 20);
  assert.equal(resultB1.level, 'B1');

  const resultC2 = calculateProficiencyScore(2500, 100);
  assert.equal(resultC2.level, 'C2');
});

test('spaced repetition: calculateNextReview resets on 0 rating and advances on good rating', () => {
  const initial = { repetitions: 2, intervalDays: 6, easeFactor: 2.5 };
  
  // Failure resets
  const failed = calculateNextReview(initial, 0, new Date('2026-10-01T00:00:00Z'));
  assert.equal(failed.repetitions, 0);
  assert.equal(failed.intervalDays, 1);
  assert.equal(failed.isMastered, false);

  // Success advances interval
  const success = calculateNextReview(initial, 2, new Date('2026-10-01T00:00:00Z'));
  assert.equal(success.repetitions, 3);
  assert.ok(success.intervalDays >= 15);
  assert.ok(success.easeFactor >= 2.4);
});

test('spaced repetition: isCardDueForReview detects past and future dates', () => {
  const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
  const futureDate = new Date(Date.now() + 86400 * 1000).toISOString();

  assert.equal(isCardDueForReview(pastDate), true);
  assert.equal(isCardDueForReview(futureDate), false);
});

test('passport utils: evaluateUnlockedStamps unlocks eligible stamps based on word count', () => {
  const milestones = [
    { language: 'ja' as const, wordsLearned: 160, conversationsHeld: 6, streakDays: 14 },
    { language: 'fr' as const, wordsLearned: 60, conversationsHeld: 2, streakDays: 5 },
  ];

  const unlocked = evaluateUnlockedStamps(milestones, []);
  assert.ok(unlocked.some(s => s.id === 'tokyo_b1'));
  assert.ok(unlocked.some(s => s.id === 'paris_a2'));
  // London requires 400 English words, not in milestones
  assert.ok(!unlocked.some(s => s.id === 'london_c1'));
});

test('passport utils: generatePassportNumber and calculateGlobalRank', () => {
  const passportNum = generatePassportNumber('WLD');
  assert.ok(passportNum.startsWith('WLD-'));
  assert.equal(passportNum.length, 13);

  const rank = calculateGlobalRank(300, 20, 15);
  assert.ok(rank < 50000);
  assert.ok(rank >= 1);
});
