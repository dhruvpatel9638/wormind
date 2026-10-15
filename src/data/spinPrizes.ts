export interface WheelPrize {
  id: number;
  label: string;
  subLabel: string;
  icon: string;
  type: 'coins';
  amount: number;
  bgColor: string;
  accentColor: string;
}

// Former 1/2/3 hint slices now award their 25/50/75 coin equivalents.
export const SPIN_PRIZES: WheelPrize[] = [
  { id: 0, label: '+50', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 50, bgColor: '#2E1065', accentColor: '#FFD700' },
  { id: 1, label: '+50', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 50, bgColor: '#B45309', accentColor: '#FEF08A' },
  { id: 2, label: '+100', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 100, bgColor: '#5B21B6', accentColor: '#FFD700' },
  { id: 3, label: '+25', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 25, bgColor: '#D97706', accentColor: '#FEF08A' },
  { id: 4, label: '+25', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 25, bgColor: '#3B0764', accentColor: '#FDE68A' },
  { id: 5, label: '+75', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 75, bgColor: '#7C3AED', accentColor: '#E9D5FF' },
  { id: 6, label: '+250', subLabel: 'Jackpot', icon: '💎', type: 'coins', amount: 250, bgColor: '#4C1D95', accentColor: '#FDE047' },
  { id: 7, label: '+75', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 75, bgColor: '#0F766E', accentColor: '#99F6E4' },
];

export function spinTargetAngle(rotation: number, prizeIndex: number): number {
  const current = ((rotation % 360) + 360) % 360;
  const midpoint = (prizeIndex + 0.5) * (360 / SPIN_PRIZES.length);
  const target = ((270 - midpoint) % 360 + 360) % 360;
  return current + 1800 + ((target - current + 360) % 360);
}
