import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Rect,
  Polygon,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';

// 🫧 Floating Sea Bubble
export const OceanBubble: React.FC<{ size?: number; opacity?: number }> = ({ size = 28, opacity = 0.85 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" style={{ opacity }}>
    <Defs>
      <SvgGradient id="bubbleGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
        <Stop offset="40%" stopColor="#38BDF8" stopOpacity="0.4" />
        <Stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
      </SvgGradient>
    </Defs>
    <Circle cx="16" cy="16" r="14" fill="url(#bubbleGrad)" stroke="#67E8F9" strokeWidth="1.5" />
    <Ellipse cx="11" cy="10" rx="4" ry="2" fill="#FFFFFF" fillOpacity="0.8" transform="rotate(-30 11 10)" />
    <Circle cx="21" cy="21" r="1.5" fill="#FFFFFF" fillOpacity="0.5" />
  </Svg>
);

// 🪸 Coral Reef Patch (Pink, Magenta & Amber Corals)
export const OceanCoral: React.FC<{ scale?: number; color?: string }> = ({
  scale = 1,
  color = '#EC4899',
}) => {
  const width = 48 * scale;
  const height = 44 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 48 44">
      {/* Sandy Base Shadow */}
      <Ellipse cx="24" cy="40" rx="18" ry="4" fill="rgba(2, 132, 199, 0.25)" />
      {/* Main Coral Branch 1 */}
      <Path
        d="M 22 40 C 20 28, 10 24, 12 14 C 13 8, 18 12, 18 18 C 20 10, 26 8, 26 16 C 28 8, 36 10, 34 18 C 36 24, 28 28, 26 40 Z"
        fill={color}
        stroke="#BE185D"
        strokeWidth="1.5"
      />
      {/* Branch 2 Side */}
      <Path
        d="M 12 40 C 10 32, 4 30, 6 22 C 8 16, 14 20, 14 28 Z"
        fill="#F43F5E"
        stroke="#9F1239"
        strokeWidth="1"
      />
      {/* Branch 3 Gold */}
      <Path
        d="M 32 40 C 34 32, 42 28, 40 20 C 38 15, 32 20, 32 28 Z"
        fill="#F59E0B"
        stroke="#B45309"
        strokeWidth="1"
      />
      {/* Glowing Coral Dots */}
      <Circle cx="12" cy="12" r="2" fill="#FEF08A" />
      <Circle cx="26" cy="10" r="2.2" fill="#FEF08A" />
      <Circle cx="34" cy="14" r="1.8" fill="#FEF08A" />
    </Svg>
  );
};

// 🌿 Swaying Sea Kelp
export const OceanSeaweed: React.FC<{ height?: number }> = ({ height = 50 }) => (
  <Svg width={24} height={height} viewBox="0 0 24 50">
    <Path
      d="M 12 50 Q 4 38 14 26 T 10 2"
      stroke="#10B981"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M 16 50 Q 22 35 14 20 T 18 6"
      stroke="#059669"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// ⚓ Sunken Pirate Galleon (Shipwreck)
export const OceanShipwreck: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 70 70">
    {/* Seabed Trench Shadow */}
    <Ellipse cx="35" cy="62" rx="28" ry="6" fill="rgba(15, 23, 42, 0.4)" />
    {/* Broken Hull */}
    <Path
      d="M 10 40 Q 35 55 60 40 L 52 58 Q 35 64 16 58 Z"
      fill="#78350F"
      stroke="#451A03"
      strokeWidth="2"
    />
    {/* Hull Planks */}
    <Path d="M 14 46 Q 35 57 56 46" stroke="#B45309" strokeWidth="1.5" fill="none" />
    {/* Broken Mast */}
    <Rect x="32" y="16" width="5" height="30" fill="#92400E" transform="rotate(-12 34 30)" />
    <Rect x="20" y="24" width="26" height="3" fill="#92400E" transform="rotate(-12 34 30)" />
    {/* Tattered Flag */}
    <Path d="M 35 16 L 48 20 L 36 26 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
    <Circle cx="41" cy="21" r="1.5" fill="#F8FAFC" />
    {/* Seaweed Wrapping */}
    <Path d="M 16 52 Q 22 42 20 36" stroke="#10B981" strokeWidth="2.5" fill="none" />
  </Svg>
);

// 🔱 Atlantis Palace Citadel (Chapter 2 Peak Milestone)
export const OceanAtlantisPalace: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size} viewBox="0 0 80 80">
    <Defs>
      <SvgGradient id="atlantisGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#67E8F9" />
        <Stop offset="50%" stopColor="#06B6D4" />
        <Stop offset="100%" stopColor="#0369A1" />
      </SvgGradient>
    </Defs>
    {/* Glow Halo */}
    <Circle cx="40" cy="40" r="36" fill="#38BDF8" fillOpacity="0.2" />
    {/* Palace Base Platform */}
    <Polygon points="12,68 68,68 60,74 20,74" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
    {/* Columns */}
    <Rect x="20" y="38" width="6" height="30" fill="url(#atlantisGrad)" rx="2" />
    <Rect x="37" y="34" width="6" height="34" fill="url(#atlantisGrad)" rx="2" />
    <Rect x="54" y="38" width="6" height="30" fill="url(#atlantisGrad)" rx="2" />
    {/* Temple Roof Spire */}
    <Polygon points="40,8 14,36 66,36" fill="#00F2FE" stroke="#E0F2FE" strokeWidth="2" />
    <Polygon points="40,2 36,12 44,12" fill="#FDE047" />
    {/* Golden Trident emblem */}
    <Path d="M 40 20 L 40 32 M 36 22 L 36 26 M 44 22 L 44 26 M 34 26 Q 40 30 46 26" stroke="#F59E0B" strokeWidth="2" fill="none" />
  </Svg>
);

// 🐚 Ocean Milestone Pearl Chest
export const OceanChest: React.FC<{ level: number; isClaimed?: boolean }> = ({
  level,
  isClaimed = false,
}) => (
  <View style={chestStyles.wrapper}>
    <Svg width={50} height={44} viewBox="0 0 50 44">
      {/* Seabed Aura */}
      <Ellipse cx="25" cy="40" rx="20" ry="4" fill="rgba(6, 182, 212, 0.3)" />
      {/* Chest Body */}
      <Rect x="8" y="18" width="34" height="20" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" rx="4" />
      {/* Curved Dome Lid */}
      <Path d="M 8 18 Q 25 4 42 18 Z" fill="#0284C7" stroke="#67E8F9" strokeWidth="1.5" />
      {/* Gold Bands */}
      <Rect x="14" y="10" width="4" height="28" fill="#FDE047" />
      <Rect x="32" y="10" width="4" height="28" fill="#FDE047" />
      {/* Glowing Pearl Lock */}
      <Circle cx="25" cy="23" r="5" fill="#E0F2FE" stroke="#00F2FE" strokeWidth="1.5" />
      <Circle cx="23" cy="21" r="1.5" fill="#FFFFFF" />
    </Svg>
    <View style={chestStyles.badge}>
      <Text style={chestStyles.badgeText}>{isClaimed ? 'OPEN' : `LVL ${level}`}</Text>
    </View>
  </View>
);

const chestStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: '#67E8F9',
    marginTop: -4,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#E0F2FE',
  },
});
