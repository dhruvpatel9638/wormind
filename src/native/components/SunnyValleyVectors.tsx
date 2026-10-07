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

// ☀️ Radiant Valley Sun
export const ValleySun: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size} viewBox="0 0 80 80">
    <Defs>
      <SvgGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFBEB" />
        <Stop offset="0.3" stopColor="#FDE047" />
        <Stop offset="0.8" stopColor="#F59E0B" />
        <Stop offset="1" stopColor="#D97706" />
      </SvgGradient>
    </Defs>
    {/* Sunbeams */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <Polygon
        key={deg}
        points="40,2 37,12 43,12"
        fill="#FBBF24"
        transform={`rotate(${deg}, 40, 40)`}
      />
    ))}
    {/* Sun Disc */}
    <Circle cx="40" cy="40" r="24" fill="url(#sunGrad)" stroke="#F59E0B" strokeWidth="2" />
    {/* Cute smiling face */}
    <Circle cx="32" cy="36" r="2.8" fill="#78350F" />
    <Circle cx="48" cy="36" r="2.8" fill="#78350F" />
    <Circle cx="30" cy="42" r="3" fill="#FCA5A5" fillOpacity="0.8" />
    <Circle cx="50" cy="42" r="3" fill="#FCA5A5" fillOpacity="0.8" />
    <Path d="M 34 43 Q 40 48 46 43" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </Svg>
);

// 🌲 Lush Valley Tree (Oak or Pine)
export const ValleyTree: React.FC<{ type?: 'oak' | 'pine'; scale?: number }> = ({
  type = 'oak',
  scale = 1,
}) => {
  const width = 50 * scale;
  const height = 62 * scale;

  if (type === 'pine') {
    return (
      <Svg width={width} height={height} viewBox="0 0 50 62">
        {/* Shadow */}
        <Ellipse cx="25" cy="58" rx="14" ry="4" fill="rgba(0, 0, 0, 0.14)" />
        {/* Trunk */}
        <Rect x="22" y="44" width="6" height="15" fill="#78350F" rx="2" />
        {/* 3 Pine Tiers */}
        <Polygon points="25,4 8,24 42,24" fill="#0D9488" />
        <Polygon points="25,16 6,36 44,36" fill="#0F766E" />
        <Polygon points="25,28 4,48 46,48" fill="#115E59" />
        {/* Highlights */}
        <Polygon points="25,4 16,24 25,24" fill="#2DD4BF" fillOpacity="0.35" />
        <Polygon points="25,16 14,36 25,36" fill="#2DD4BF" fillOpacity="0.35" />
        <Polygon points="25,28 12,48 25,48" fill="#2DD4BF" fillOpacity="0.35" />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 50 62">
      {/* Ground Shadow */}
      <Ellipse cx="25" cy="58" rx="16" ry="4" fill="rgba(0, 0, 0, 0.12)" />
      {/* Trunk */}
      <Path d="M 21 38 L 29 38 L 31 58 L 19 58 Z" fill="#92400E" />
      {/* Oak Canopy Blobs */}
      <Circle cx="25" cy="22" r="18" fill="#10B981" />
      <Circle cx="16" cy="28" r="14" fill="#059669" />
      <Circle cx="34" cy="28" r="14" fill="#047857" />
      <Circle cx="25" cy="16" r="14" fill="#34D399" />
      {/* Canopy Highlight */}
      <Circle cx="21" cy="14" r="7" fill="#6EE7B7" fillOpacity="0.6" />
      {/* Red Berries / Apples */}
      <Circle cx="18" cy="22" r="2.5" fill="#EF4444" />
      <Circle cx="32" cy="20" r="2.5" fill="#EF4444" />
      <Circle cx="26" cy="30" r="2.2" fill="#EF4444" />
    </Svg>
  );
};

// 🏡 Sunny Valley Windmill
export const ValleyWindmill: React.FC<{ size?: number }> = ({ size = 68 }) => (
  <Svg width={size} height={size} viewBox="0 0 70 70">
    {/* Shadow */}
    <Ellipse cx="35" cy="65" rx="22" ry="5" fill="rgba(0, 0, 0, 0.15)" />
    {/* Tower Base */}
    <Polygon points="25,30 45,30 49,64 21,64" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
    {/* Tower Door & Window */}
    <Rect x="31" y="48" width="8" height="15" fill="#78350F" rx="4" />
    <Circle cx="35" cy="38" r="3.5" fill="#38BDF8" stroke="#D97706" strokeWidth="1" />
    {/* Roof */}
    <Polygon points="35,16 19,30 51,30" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
    {/* Sails Pivot Hub */}
    <Circle cx="35" cy="30" r="4" fill="#78350F" />
    {/* 4 Windmill Blades / Sails */}
    <Path d="M 35 30 L 15 15 L 20 12 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
    <Path d="M 35 30 L 55 15 L 50 12 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
    <Path d="M 35 30 L 55 45 L 50 48 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
    <Path d="M 35 30 L 15 45 L 20 48 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
  </Svg>
);

// 🌻 Sunflowers & Wildflowers Patch
export const ValleyFlowerPatch: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const width = 46 * scale;
  const height = 34 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 46 34">
      {/* Ground Grass Tuft */}
      <Path d="M 6 30 Q 12 18 16 32 M 16 32 Q 22 16 26 32 M 28 32 Q 34 20 40 32" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Sunflower 1 (Large Center) */}
      <G transform="translate(23, 14)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <Ellipse key={deg} cx="0" cy="-8" rx="2.5" ry="5.5" fill="#F59E0B" transform={`rotate(${deg})`} />
        ))}
        <Circle cx="0" cy="0" r="4.5" fill="#78350F" />
      </G>

      {/* Sunflower 2 (Left Small) */}
      <G transform="translate(10, 18)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <Ellipse key={deg} cx="0" cy="-5" rx="1.8" ry="4" fill="#FBBF24" transform={`rotate(${deg})`} />
        ))}
        <Circle cx="0" cy="0" r="3" fill="#854D0E" />
      </G>

      {/* Pink Wildflower 3 (Right) */}
      <G transform="translate(36, 17)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <Circle key={deg} cx="0" cy="-5" r="3" fill="#EC4899" transform={`rotate(${deg})`} />
        ))}
        <Circle cx="0" cy="0" r="2.5" fill="#FDE047" />
      </G>
    </Svg>
  );
};

// 🪵 Wooden Trail Signpost
export const ValleySignpost: React.FC<{ label?: string }> = ({ label = 'VALLEY PASS' }) => (
  <View style={signStyles.wrapper}>
    <Svg width={54} height={42} viewBox="0 0 54 42">
      {/* Post */}
      <Rect x="23" y="16" width="8" height="26" fill="#78350F" rx="2" />
      {/* Wooden Signboard */}
      <Polygon points="4,4 46,4 52,14 46,24 4,24" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
      {/* Nail Heads */}
      <Circle cx="10" cy="14" r="1.5" fill="#451A03" />
      <Circle cx="40" cy="14" r="1.5" fill="#451A03" />
    </Svg>
    <View style={signStyles.textContainer}>
      <Text style={signStyles.signText}>{label}</Text>
    </View>
  </View>
);

const signStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: 5,
    left: 4,
    width: 40,
    alignItems: 'center',
  },
  signText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#FFFBEB',
    letterSpacing: 0.2,
  },
});

// 🎁 Milestone Treasure Chest
export const MilestoneChest: React.FC<{ level: number; isClaimed?: boolean }> = ({
  level,
  isClaimed = false,
}) => (
  <View style={chestStyles.wrapper}>
    <Svg width={48} height={42} viewBox="0 0 48 42">
      {/* Ground Pedestal */}
      <Ellipse cx="24" cy="38" rx="18" ry="4" fill="rgba(0, 0, 0, 0.16)" />
      {/* Chest Base */}
      <Rect x="8" y="18" width="32" height="18" fill="#B45309" stroke="#78350F" strokeWidth="1.5" rx="3" />
      {/* Chest Curved Lid */}
      <Path d="M 8 18 Q 24 6 40 18 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
      {/* Gold Trim Bands */}
      <Rect x="14" y="10" width="4" height="26" fill="#FBBF24" />
      <Rect x="30" y="10" width="4" height="26" fill="#FBBF24" />
      {/* Gold Lock Plate */}
      <Circle cx="24" cy="22" r="4" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
      <Circle cx="24" cy="22" r="1.5" fill="#451A03" />
      {/* Shimmer Star */}
      <Polygon points="12,8 14,13 19,13 15,16 17,21 12,18 7,21 9,16 5,13 10,13" fill="#FFFBEB" transform="scale(0.5) translate(4, 4)" />
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: -4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#451A03',
  },
});

// ☁️ Fluffy Sky Cloud
export const ValleyCloud: React.FC<{ scale?: number; opacity?: number }> = ({
  scale = 1,
  opacity = 0.9,
}) => {
  const width = 64 * scale;
  const height = 32 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 64 32" style={{ opacity }}>
      <Circle cx="20" cy="18" r="12" fill="#FFFFFF" />
      <Circle cx="32" cy="14" r="14" fill="#FFFFFF" />
      <Circle cx="44" cy="18" r="12" fill="#FFFFFF" />
      <Rect x="14" y="18" width="36" height="12" fill="#FFFFFF" rx="4" />
    </Svg>
  );
};

// 🦋 Fluttering Butterfly
export const ValleyButterfly: React.FC<{ color?: string }> = ({ color = '#EC4899' }) => (
  <Svg width={20} height={18} viewBox="0 0 20 18">
    <Ellipse cx="7" cy="6" rx="5" ry="4" fill={color} transform="rotate(-25, 7, 6)" />
    <Ellipse cx="13" cy="6" rx="5" ry="4" fill={color} transform="rotate(25, 13, 6)" />
    <Ellipse cx="7" cy="12" rx="3.5" ry="2.5" fill="#F472B6" />
    <Ellipse cx="13" cy="12" rx="3.5" ry="2.5" fill="#F472B6" />
    <Rect x="9" y="4" width="2" height="10" fill="#4B5563" rx="1" />
  </Svg>
);
