
export enum Orientation {
  UPRIGHT = 'upright',
  REVERSED = 'reversed'
}

export type Language = 'zh' | 'en';

export interface TarotCardData {
  id: string;
  name: string;
  nameEn: string;
  value: string;
  meaningUp: string;
  meaningUpEn: string;
  meaningRev: string;
  meaningRevEn: string;
  imageUrl: string;
}

export interface DrawnCard {
  card: TarotCardData;
  orientation: Orientation;
  timestamp: number;
}

export enum GestureType {
  NONE = 'NONE',
  OPEN = 'OPEN',
  PINCH = 'PINCH',
  FIST = 'FIST',
  POINT = 'POINT'
}

export interface SpreadType {
  id: string;
  name: string;
  nameEn: string;
  count: number;
  slots: string[];
  slotsEn: string[];
}

export enum GameState {
  INTRO = 'INTRO',
  SETUP = 'SETUP',
  DRAWING = 'DRAWING',
  READING = 'READING',
  HISTORY = 'HISTORY'
}
