import { LanguageCode, PassportStamp, UserPassport } from '../types/index.ts';

export interface MilestoneCheck {
  language: LanguageCode;
  wordsLearned: number;
  conversationsHeld: number;
  streakDays: number;
}

export const OFFICIAL_STAMPS_CATALOG: Omit<PassportStamp, 'dateAwarded'>[] = [
  {
    id: 'tokyo_b1',
    language: 'ja',
    city: 'Токио',
    country: 'Япония',
    title: 'Tokyo Nihongo Guild',
    description: 'Освоено более 150 слов и проведено 5 бесед с носителями из Токио',
    cefrLevel: 'B1',
    stampDesign: 'circular',
    primaryColor: '#F43F5E', // Cherry red
    iconName: 'ToriiGate',
  },
  {
    id: 'madrid_b2',
    language: 'es',
    city: 'Мадрид',
    country: 'Испания',
    title: 'Puerta del Sol Diploma',
    description: 'Свободное владение разговорным испанским языком',
    cefrLevel: 'B2',
    stampDesign: 'crest',
    primaryColor: '#F59E0B', // Amber gold
    iconName: 'Sun',
  },
  {
    id: 'paris_a2',
    language: 'fr',
    city: 'Париж',
    country: 'Франция',
    title: 'Flâneur de la Seine',
    description: 'Базовый этикет, заказ кофе и ориентирование в Париже',
    cefrLevel: 'A2',
    stampDesign: 'oval',
    primaryColor: '#3B82F6', // French blue
    iconName: 'Landmark',
  },
  {
    id: 'berlin_b1',
    language: 'de',
    city: 'Берлин',
    country: 'Германия',
    title: 'Berliner Sprachzertifikat',
    description: 'Уверенное общение на повседневные и профессиональные темы',
    cefrLevel: 'B1',
    stampDesign: 'hexagonal',
    primaryColor: '#10B981', // Emerald
    iconName: 'ShieldCheck',
  },
  {
    id: 'london_c1',
    language: 'en',
    city: 'Лондон',
    country: 'Великобритания',
    title: 'Royal Lexicon Fellow',
    description: 'Продвинутая академическая и деловая речь',
    cefrLevel: 'C1',
    stampDesign: 'crest',
    primaryColor: '#8B5CF6', // Royal purple
    iconName: 'Award',
  },
];

/**
 * Generates an authentic biometric passport number string
 */
export function generatePassportNumber(countryCode: string = 'GL'): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `${countryCode}-${l1}${l2}${num}`;
}

/**
 * Checks for newly unlocked stamps
 */
export function evaluateUnlockedStamps(
  milestones: MilestoneCheck[],
  existingStampIds: string[]
): PassportStamp[] {
  const newStamps: PassportStamp[] = [];
  const currentDate = new Date().toISOString().split('T')[0];

  for (const catalogStamp of OFFICIAL_STAMPS_CATALOG) {
    if (existingStampIds.includes(catalogStamp.id)) continue;

    const langMilestone = milestones.find(m => m.language === catalogStamp.language);
    if (!langMilestone) continue;

    let qualifies = false;
    if (catalogStamp.cefrLevel === 'A1' && langMilestone.wordsLearned >= 20) qualifies = true;
    if (catalogStamp.cefrLevel === 'A2' && langMilestone.wordsLearned >= 50) qualifies = true;
    if (catalogStamp.cefrLevel === 'B1' && langMilestone.wordsLearned >= 100) qualifies = true;
    if (catalogStamp.cefrLevel === 'B2' && langMilestone.wordsLearned >= 200) qualifies = true;
    if (catalogStamp.cefrLevel === 'C1' && langMilestone.wordsLearned >= 400) qualifies = true;

    if (qualifies) {
      newStamps.push({
        ...catalogStamp,
        dateAwarded: currentDate,
      });
    }
  }

  return newStamps;
}

/**
 * Calculates overall global rank index
 */
export function calculateGlobalRank(totalWords: number, streakDays: number, totalConvs: number): number {
  const baseRank = 50000;
  const score = totalWords * 15 + streakDays * 50 + totalConvs * 30;
  const rank = Math.max(1, baseRank - score);
  return rank;
}
