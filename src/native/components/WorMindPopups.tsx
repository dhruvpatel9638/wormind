import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, {
  Path,
  G,
  Circle,
  Rect,
  Polygon,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient as SvgRadial,
  Stop,
  Ellipse,
} from 'react-native-svg';
import { nativeAudio } from '../audio';
import { nativeHaptics } from '../haptics';

// ══════════════════════════════════════════════════════════════════════════════
// 1. REUSABLE 3D JUICY GAME BUTTON
// ══════════════════════════════════════════════════════════════════════════════
export interface Game3DButtonProps {
  title: string;
  variant?: 'green' | 'purple' | 'gray' | 'blue' | 'fire' | 'red';
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  height?: number;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export const Game3DButton: React.FC<Game3DButtonProps> = ({
  title,
  variant = 'green',
  onPress,
  disabled = false,
  style,
  height = 50,
  icon,
}) => {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
  };

  const getColors = () => {
    switch (variant) {
      case 'purple':
        return {
          gradient: ['#E879F9', '#C026D3', '#9333EA'] as const,
          bottomLip: '#6B21A8',
          textColor: '#FFFFFF',
          textShadow: '#581C87',
          highlight: 'rgba(255, 255, 255, 0.45)',
        };
      case 'gray':
        return {
          gradient: ['#FFFFFF', '#E2E8F0', '#CBD5E1'] as const,
          bottomLip: '#94A3B8',
          textColor: '#1E293B',
          textShadow: 'rgba(255, 255, 255, 0.8)',
          highlight: 'rgba(255, 255, 255, 0.7)',
        };
      case 'blue':
        return {
          gradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
          bottomLip: '#075985',
          textColor: '#FFFFFF',
          textShadow: '#0C4A6E',
          highlight: 'rgba(255, 255, 255, 0.45)',
        };
      case 'red':
        return {
          gradient: ['#F87171', '#EF4444', '#DC2626'] as const,
          bottomLip: '#991B1B',
          textColor: '#FFFFFF',
          textShadow: '#7F1D1D',
          highlight: 'rgba(255, 255, 255, 0.45)',
        };
      case 'fire':
        return {
          gradient: ['#FDE047', '#F97316', '#EF4444'] as const,
          bottomLip: '#991B1B',
          textColor: '#FFFFFF',
          textShadow: '#7F1D1D',
          highlight: 'rgba(255, 255, 255, 0.55)',
        };
      case 'green':
      default:
        return {
          gradient: ['#4ADE80', '#22C55E', '#16A34A'] as const,
          bottomLip: '#14532D',
          textColor: '#FFFFFF',
          textShadow: '#052E16',
          highlight: 'rgba(255, 255, 255, 0.45)',
        };
    }
  };

  const c = getColors();

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  return (
    <Pressable
      onPress={() => {
        nativeAudio.playLetterTap(1);
        nativeHaptics.light();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.btnWrapper, style, disabled && { opacity: 0.55 }]}
    >
      <View style={[styles.btnLip, { backgroundColor: c.bottomLip, borderRadius: height / 2, height }]} />
      <Animated.View style={{ transform: [{ translateY }] }}>
        <LinearGradient
          colors={c.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.btnBody,
            {
              borderRadius: height / 2,
              height: height - 4,
              borderColor: 'rgba(255,255,255,0.3)',
            },
            variant === 'fire' && styles.fireGlow,
          ]}
        >
          {/* Top Shiny Highlight Pill */}
          <View style={[styles.btnHighlight, { borderRadius: (height - 4) / 4 }]} />

          <View style={styles.btnContentRow}>
            {icon && (
              <MaterialIcons
                name={icon}
                size={22}
                color={c.textColor}
                style={{ marginRight: 6, textShadowColor: c.textShadow, textShadowRadius: 2 }}
              />
            )}
            <Text
              style={[
                styles.btnText,
                {
                  color: c.textColor,
                  textShadowColor: c.textShadow,
                  textShadowOffset: { width: 0, height: 1.5 },
                  textShadowRadius: 2,
                },
              ]}
            >
              {title}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. 3D GOLDEN & THEMED CURVED RIBBON BANNER
// ══════════════════════════════════════════════════════════════════════════════
export interface GoldenRibbonProps {
  title: string;
  variant?: 'gold' | 'fire' | 'red' | 'ocean' | 'emerald';
  isFire?: boolean;
}

export const GoldenRibbon: React.FC<GoldenRibbonProps> = ({ title, variant, isFire = false }) => {
  const activeVariant = variant || (isFire ? 'fire' : 'gold');

  const getRibbonTheme = () => {
    switch (activeVariant) {
      case 'red':
        return {
          topStop: '#FECACA',
          midStop1: '#F87171',
          midStop2: '#DC2626',
          botStop: '#991B1B',
          tailTop: '#EF4444',
          tailBot: '#991B1B',
          darkTailTop: '#7F1D1D',
          darkTailBot: '#450A0A',
          stroke: '#7F1D1D',
          textShadow: '#450A0A',
        };
      case 'ocean':
        return {
          topStop: '#BAE6FD',
          midStop1: '#38BDF8',
          midStop2: '#0284C7',
          botStop: '#0369A1',
          tailTop: '#0EA5E9',
          tailBot: '#0369A1',
          darkTailTop: '#075985',
          darkTailBot: '#0C4A6E',
          stroke: '#075985',
          textShadow: '#082F49',
        };
      case 'emerald':
        return {
          topStop: '#A7F3D0',
          midStop1: '#34D399',
          midStop2: '#059669',
          botStop: '#047857',
          tailTop: '#10B981',
          tailBot: '#047857',
          darkTailTop: '#065F46',
          darkTailBot: '#064E3B',
          stroke: '#065F46',
          textShadow: '#022C22',
        };
      case 'fire':
        return {
          topStop: '#FED7AA',
          midStop1: '#FB923C',
          midStop2: '#EA580C',
          botStop: '#C2410C',
          tailTop: '#F97316',
          tailBot: '#C2410C',
          darkTailTop: '#9A3412',
          darkTailBot: '#431407',
          stroke: '#9A3412',
          textShadow: '#431407',
        };
      case 'gold':
      default:
        return {
          topStop: '#FFF0A0',
          midStop1: '#FFD000',
          midStop2: '#F59E0B',
          botStop: '#D97706',
          tailTop: '#FBBF24',
          tailBot: '#D97706',
          darkTailTop: '#B45309',
          darkTailBot: '#78350F',
          stroke: '#B45309',
          textShadow: '#451A03',
        };
    }
  };

  const theme = getRibbonTheme();

  return (
    <View style={styles.ribbonContainer}>
      {/* Optional Top Flame Crest for Streak Modal */}
      {activeVariant === 'fire' && (
        <View style={styles.ribbonFlameCrest}>
          <Svg width={120} height={28} viewBox="0 0 120 28">
            <Defs>
              <SvgGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0%" stopColor="#EA580C" />
                <Stop offset="50%" stopColor="#F97316" />
                <Stop offset="100%" stopColor="#FDE047" />
              </SvgGradient>
            </Defs>
            <Path
              d="M 10 28 C 15 18, 12 12, 22 8 C 26 16, 30 18, 38 4 C 44 14, 50 16, 60 0 C 70 16, 76 14, 82 4 C 90 18, 94 16, 98 8 C 108 12, 105 18, 110 28 Z"
              fill="url(#flameGrad)"
            />
          </Svg>
        </View>
      )}

      {/* SVG Ribbon with Left & Right 3D Folded Tails */}
      <View style={styles.ribbonSvgWrapper}>
        <Svg width={290} height={52} viewBox="0 0 290 52">
          <Defs>
            {/* Themed Ribbon Gradient */}
            <SvgGradient id={`ribbonMain-${activeVariant}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.topStop} />
              <Stop offset="15%" stopColor={theme.midStop1} />
              <Stop offset="70%" stopColor={theme.midStop2} />
              <Stop offset="100%" stopColor={theme.botStop} />
            </SvgGradient>
            {/* Dark Tail Fold Shadow */}
            <SvgGradient id={`ribbonDarkTail-${activeVariant}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.darkTailTop} />
              <Stop offset="100%" stopColor={theme.darkTailBot} />
            </SvgGradient>
            {/* Tail Front Gradient */}
            <SvgGradient id={`ribbonTail-${activeVariant}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.tailTop} />
              <Stop offset="100%" stopColor={theme.tailBot} />
            </SvgGradient>
          </Defs>

          {/* Left Ribbon Tail */}
          <Path d="M 0 14 L 38 14 L 38 44 L 0 44 L 14 29 Z" fill={`url(#ribbonTail-${activeVariant})`} />
          {/* Left Ribbon Fold Under-Shadow */}
          <Polygon points="38,36 38,44 48,36" fill={`url(#ribbonDarkTail-${activeVariant})`} />

          {/* Right Ribbon Tail */}
          <Path d="M 290 14 L 252 14 L 252 44 L 290 44 L 276 29 Z" fill={`url(#ribbonTail-${activeVariant})`} />
          {/* Right Ribbon Fold Under-Shadow */}
          <Polygon points="252,36 252,44 242,36" fill={`url(#ribbonDarkTail-${activeVariant})`} />

          {/* Center Main Ribbon Banner Body (Subtly curved top and bottom) */}
          <Path
            d="M 28 8 Q 145 2 262 8 L 252 42 Q 145 48 38 42 Z"
            fill={`url(#ribbonMain-${activeVariant})`}
            stroke={theme.stroke}
            strokeWidth="1.5"
          />
          {/* Top Gloss Highlight Strip */}
          <Path
            d="M 34 10 Q 145 5 256 10 L 254 14 Q 145 9 36 14 Z"
            fill="#FFFFFF"
            fillOpacity="0.5"
          />
        </Svg>

        {/* Embossed Bold Ribbon Text */}
        <View style={styles.ribbonTextContainer}>
          <Text
            style={[
              styles.ribbonTitleText,
              {
                textShadowColor: theme.textShadow,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. MASTER WOODEN MODAL FRAME
// ══════════════════════════════════════════════════════════════════════════════
export interface WoodenPopupCardProps {
  children: React.ReactNode;
  ribbonTitle?: string;
  ribbonVariant?: 'gold' | 'fire' | 'red' | 'ocean' | 'emerald';
  isFireRibbon?: boolean;
  topBadge?: React.ReactNode;
  cardGradient?: readonly [string, string, ...string[]];
  innerBorderColor?: string;
  maxWidth?: number;
}

export const WoodenPopupCard: React.FC<WoodenPopupCardProps> = ({
  children,
  ribbonTitle,
  ribbonVariant,
  isFireRibbon = false,
  topBadge,
  cardGradient = ['#1E4C9A', '#13356E', '#0B1E43'] as const,
  innerBorderColor = '#38BDF8',
  maxWidth = 320,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, maxWidth);
  const effectiveRibbonVariant = ribbonVariant || (isFireRibbon ? 'fire' : 'gold');

  return (
    <View style={[styles.woodenOuterBezel, { width: cardWidth }]}>
      {/* Wood Texture Highlight Layers */}
      <View style={styles.woodGrainRim}>
        {/* Inner Colored Gradient Canvas */}
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.innerSapphireCard}
        >
          {/* Inner Glow Border */}
          <View style={[styles.innerCyanBorder, { borderColor: innerBorderColor }]} pointerEvents="none" />

          {/* Content */}
          <View style={styles.woodenCardContent}>{children}</View>
        </LinearGradient>
      </View>

      {/* Top Banner or Badge if specified */}
      {topBadge && <View style={styles.topBadgeWrapper}>{topBadge}</View>}
      {ribbonTitle && (
        <View style={styles.ribbonAnchor}>
          <GoldenRibbon
            title={ribbonTitle}
            variant={effectiveRibbonVariant}
            isFire={effectiveRibbonVariant === 'fire'}
          />
        </View>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. VECTOR ARTWORKS (Chest, Ruby Heart, Flame Mascot)
// ══════════════════════════════════════════════════════════════════════════════

// 🌟 Treasure Chest with Overflowing Gold Coins & Light Rays (Popup 2)
export const TreasureChestVector: React.FC<{ size?: number }> = ({ size = 150 }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.chestContainer, { width: size, height: size * 0.85 }]}>
      {/* Rotating Sunburst Halo Rays */}
      <Animated.View style={[styles.sunburstContainer, { transform: [{ rotate: spin }] }]}>
        <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 160 160">
          <Defs>
            <SvgRadial id="sunburstGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
              <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </SvgRadial>
          </Defs>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <Path
              key={deg}
              d="M 80 80 L 72 0 L 88 0 Z"
              fill="url(#sunburstGrad)"
              transform={`rotate(${deg} 80 80)`}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Floating 4-Point Golden Stars */}
      <View style={styles.chestStarsWrapper} pointerEvents="none">
        <Svg width={size} height={size * 0.85} viewBox="0 0 160 136">
          {/* Star Top-Left */}
          <Path
            d="M 28 22 Q 28 30 20 30 Q 28 30 28 38 Q 28 30 36 30 Q 28 30 28 22 Z"
            fill="#FDE047"
          />
          {/* Star Mid-Left */}
          <Path
            d="M 18 58 Q 18 64 12 64 Q 18 64 18 70 Q 18 64 24 64 Q 18 64 18 58 Z"
            fill="#FEF08A"
          />
          {/* Star Top-Right */}
          <Path
            d="M 134 26 Q 134 34 126 34 Q 134 34 134 42 Q 134 34 142 34 Q 134 34 134 26 Z"
            fill="#FDE047"
          />
          {/* Star Mid-Right */}
          <Path
            d="M 144 62 Q 144 67 139 67 Q 144 67 144 72 Q 144 67 149 67 Q 144 67 144 62 Z"
            fill="#FEF08A"
          />
        </Svg>
      </View>

      {/* Open Treasure Chest SVG */}
      <Svg width={size} height={size * 0.85} viewBox="0 0 160 136">
        <Defs>
          {/* Wood Chest Gradient */}
          <SvgGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#A16207" />
            <Stop offset="50%" stopColor="#713F12" />
            <Stop offset="100%" stopColor="#451A03" />
          </SvgGradient>
          {/* Chest Metal Rim Gradient */}
          <SvgGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#CBD5E1" />
            <Stop offset="50%" stopColor="#64748B" />
            <Stop offset="100%" stopColor="#334155" />
          </SvgGradient>
          {/* Gold Coin Gradient */}
          <SvgGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="40%" stopColor="#FACC15" />
            <Stop offset="100%" stopColor="#CA8A04" />
          </SvgGradient>
          {/* Chest Inner Glow */}
          <SvgRadial id="chestInnerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
          </SvgRadial>
        </Defs>

        {/* Chest Ground Shadow */}
        <Ellipse cx="80" cy="126" rx="60" ry="8" fill="#050C1B" fillOpacity="0.6" />

        {/* Open Chest Lid (Tilted Back) */}
        <Path
          d="M 32 38 C 32 20, 128 20, 128 38 L 122 52 L 38 52 Z"
          fill="url(#woodGrad)"
          stroke="#451A03"
          strokeWidth="2"
        />
        {/* Lid Metal Band */}
        <Path d="M 76 22 L 84 22 L 84 52 L 76 52 Z" fill="url(#metalGrad)" />
        <Circle cx="80" cy="36" r="3" fill="#FDE047" />

        {/* Interior Gold Glow */}
        <Ellipse cx="80" cy="62" rx="42" ry="16" fill="url(#chestInnerGlow)" />

        {/* Mound of Golden Coins inside Chest */}
        <Ellipse cx="80" cy="66" rx="44" ry="14" fill="#CA8A04" />
        {/* Individual Coins Stacked */}
        <Circle cx="64" cy="58" r="8" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="78" cy="54" r="8.5" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="94" cy="57" r="8" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="70" cy="64" r="7.5" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="86" cy="63" r="8" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="102" cy="65" r="7" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Circle cx="56" cy="66" r="7" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />

        {/* Chest Main Box Body */}
        <Path
          d="M 32 64 L 128 64 L 122 118 L 38 118 Z"
          fill="url(#woodGrad)"
          stroke="#451A03"
          strokeWidth="2"
        />

        {/* Metal Corner Brackets */}
        <Path d="M 32 64 L 44 64 L 46 118 L 38 118 Z" fill="url(#metalGrad)" />
        <Path d="M 128 64 L 116 64 L 114 118 L 122 118 Z" fill="url(#metalGrad)" />

        {/* Center Metal Latch Plate */}
        <Path
          d="M 72 64 L 88 64 L 86 86 L 80 92 L 74 86 Z"
          fill="url(#metalGrad)"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        {/* Keyhole */}
        <Circle cx="80" cy="74" r="3" fill="#0F172A" />
        <Polygon points="78.5,74 81.5,74 82,82 78,82" fill="#0F172A" />

        {/* Coins Spilling at the Base */}
        <Ellipse cx="28" cy="118" rx="8" ry="4" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Ellipse cx="24" cy="122" rx="7" ry="3.5" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Ellipse cx="132" cy="119" rx="8" ry="4" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Ellipse cx="138" cy="123" rx="7" ry="3.5" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
        <Ellipse cx="127" cy="124" rx="7" ry="3.5" fill="url(#coinGrad)" stroke="#A16207" strokeWidth="1" />
      </Svg>
    </View>
  );
};

// 💎 Faceted 3D Ruby Heart Gem (Popup 3)
export const RubyHeartGem: React.FC<{ size?: number }> = ({ size = 68 }) => {
  return (
    <View style={{ width: size, height: size * 0.9 }}>
      <Svg width={size} height={size * 0.9} viewBox="0 0 68 62">
        <Defs>
          <SvgGradient id="rubyBase" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FB7185" />
            <Stop offset="50%" stopColor="#E11D48" />
            <Stop offset="100%" stopColor="#9F1239" />
          </SvgGradient>
          <SvgGradient id="rubyHighlight" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#FDA4AF" stopOpacity="0.1" />
          </SvgGradient>
        </Defs>

        {/* Outer Wooden/Gold Bracket Rim */}
        <Path
          d="M 34 58 C 14 44 4 32 4 19 C 4 9 12 2 22 2 C 28 2 32 5 34 8 C 36 5 40 2 46 2 C 56 2 64 9 64 19 C 64 32 54 44 34 58 Z"
          fill="#451A03"
          stroke="#92400E"
          strokeWidth="3.5"
        />

        {/* Main Heart Body */}
        <Path
          d="M 34 54 C 16 42 8 30 8 19 C 8 11 14 5 22 5 C 27 5 31 8 34 11 C 37 8 41 5 46 5 C 54 5 60 11 60 19 C 60 30 52 42 34 54 Z"
          fill="url(#rubyBase)"
        />

        {/* Facet Polygons for 3D Gem Sparkle */}
        <Polygon points="34,11 22,5 34,26" fill="#FDA4AF" fillOpacity="0.45" />
        <Polygon points="34,11 46,5 34,26" fill="#F43F5E" fillOpacity="0.3" />
        <Polygon points="22,5 8,19 20,24" fill="url(#rubyHighlight)" />
        <Polygon points="46,5 60,19 48,24" fill="#BE123C" fillOpacity="0.5" />
        <Polygon points="8,19 34,54 24,32" fill="#881337" fillOpacity="0.5" />
        <Polygon points="60,19 34,54 44,32" fill="#4C0519" fillOpacity="0.5" />
        <Polygon points="34,26 24,32 34,54" fill="#BE123C" fillOpacity="0.3" />
        <Polygon points="34,26 44,32 34,54" fill="#9F1239" fillOpacity="0.3" />

        {/* Sparkle Glint on Top-Left */}
        <Circle cx="18" cy="14" r="2.5" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

// 🔥 Cute Animated 3D Flame Mascot in Wooden Bowl (Popup 4)
export const FlameMascotVector: React.FC<{ size?: number }> = ({ size = 110 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={{ width: size, height: size * 1.05, transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
      <Svg width={size} height={size * 1.05} viewBox="0 0 110 116">
        <Defs>
          {/* Flame Outer Gradient */}
          <SvgGradient id="flameOuter" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#EA580C" />
            <Stop offset="40%" stopColor="#F97316" />
            <Stop offset="100%" stopColor="#FACC15" />
          </SvgGradient>
          {/* Flame Inner Core Glow */}
          <SvgGradient id="flameInner" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#FFFFFF" />
          </SvgGradient>
          {/* Wooden Bowl Gradient */}
          <SvgGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#A16207" />
            <Stop offset="60%" stopColor="#713F12" />
            <Stop offset="100%" stopColor="#3B1A0A" />
          </SvgGradient>
        </Defs>

        {/* Flame Character Body */}
        <Path
          d="M 55 4 C 62 18, 76 22, 84 36 C 94 52, 92 72, 80 84 C 68 96, 42 96, 30 84 C 18 72, 16 52, 26 36 C 34 22, 48 18, 55 4 Z"
          fill="url(#flameOuter)"
          stroke="#C2410C"
          strokeWidth="2"
        />

        {/* Inner Yellow Flame Heart */}
        <Path
          d="M 55 24 C 60 34, 70 38, 74 48 C 80 60, 78 74, 68 82 C 60 88, 48 88, 42 82 C 32 74, 30 60, 36 48 C 40 38, 50 34, 55 24 Z"
          fill="url(#flameInner)"
        />

        {/* Cute Big Cartoon Eyes */}
        {/* Left Eye */}
        <Ellipse cx="44" cy="54" rx="6" ry="8" fill="#1E293B" />
        <Circle cx="42" cy="51" r="2.5" fill="#FFFFFF" />
        <Circle cx="46" cy="57" r="1.2" fill="#FFFFFF" />

        {/* Right Eye */}
        <Ellipse cx="66" cy="54" rx="6" ry="8" fill="#1E293B" />
        <Circle cx="64" cy="51" r="2.5" fill="#FFFFFF" />
        <Circle cx="68" cy="57" r="1.2" fill="#FFFFFF" />

        {/* Smiling Open Mouth */}
        <Path
          d="M 47 67 Q 55 77 63 67 Q 55 71 47 67 Z"
          fill="#881337"
          stroke="#4C0519"
          strokeWidth="1"
        />
        <Path d="M 51 71 Q 55 76 59 71 Z" fill="#FB7185" />

        {/* Cute Rosy Cheeks */}
        <Circle cx="37" cy="62" r="4.5" fill="#EF4444" fillOpacity="0.4" />
        <Circle cx="73" cy="62" r="4.5" fill="#EF4444" fillOpacity="0.4" />

        {/* Wooden Pot / Bowl */}
        <Path
          d="M 24 82 L 86 82 L 80 110 L 30 110 Z"
          fill="url(#potGrad)"
          stroke="#3B1A0A"
          strokeWidth="2.5"
        />
        {/* Pot Rim Highlight */}
        <Rect x="20" y="79" width="70" height="7" rx="3.5" fill="#CA8A04" stroke="#451A03" strokeWidth="1.5" />
      </Svg>
    </Animated.View>
  );
};

// 💔 Broken Heart Vector (for Game Over Modal)
export const BrokenHeartClockVector: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pulseAnim }],
      }}
    >
      <Svg width={size} height={size * 0.9} viewBox="0 0 96 86">
        <Defs>
          <SvgGradient id="brokenHeartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F87171" />
            <Stop offset="45%" stopColor="#DC2626" />
            <Stop offset="100%" stopColor="#7F1D1D" />
          </SvgGradient>
          <SvgRadial id="brokenHeartGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </SvgRadial>
        </Defs>

        {/* Ambient Red Glow Halo */}
        <Circle cx="48" cy="43" r="42" fill="url(#brokenHeartGlow)" />

        {/* Left Heart Half */}
        <Path
          d="M 48 24 C 48 10, 20 6, 12 26 C 6 44, 30 60, 48 76 L 48 54 L 42 46 L 49 38 L 44 30 Z"
          fill="url(#brokenHeartGrad)"
          stroke="#450A0A"
          strokeWidth="2"
        />

        {/* Right Heart Half (offset slightly) */}
        <Path
          d="M 51 26 L 56 34 L 50 42 L 55 50 L 50 74 C 68 58, 90 42, 84 26 C 76 6, 48 12, 51 26 Z"
          fill="url(#brokenHeartGrad)"
          stroke="#450A0A"
          strokeWidth="2"
        />

        {/* Golden Crack Highlight */}
        <Path
          d="M 47 28 L 52 36 L 46 44 L 52 52 L 49 66"
          stroke="#FEF08A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

// ⚠️ Tactile 3D Warning Hazard Shield (for Reset Progress Modal)
export const WarningHazardVector: React.FC<{ size?: number }> = ({ size = 84 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 84 84">
        <Defs>
          <SvgGradient id="warnShieldGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="60%" stopColor="#B91C1C" />
            <Stop offset="100%" stopColor="#7F1D1D" />
          </SvgGradient>
          <SvgGradient id="warnGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FEF08A" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#B45309" />
          </SvgGradient>
          <SvgRadial id="warnGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </SvgRadial>
        </Defs>

        <Circle cx="42" cy="42" r="38" fill="url(#warnGlow)" />

        {/* Drop Shadow */}
        <Path
          d="M 42 8 L 72 22 L 72 50 Q 42 78 42 78 Q 12 50 12 50 L 12 22 Z"
          fill="#000000"
          fillOpacity="0.35"
          transform="translate(0, 3)"
        />

        {/* Golden Bracket Shield Rim */}
        <Path
          d="M 42 8 L 72 22 L 72 50 Q 42 78 42 78 Q 12 50 12 50 L 12 22 Z"
          fill="url(#warnGoldGrad)"
          stroke="#78350F"
          strokeWidth="2"
        />

        {/* Inner Crimson Shield Body */}
        <Path
          d="M 42 14 L 66 26 L 66 48 Q 42 71 42 71 Q 18 48 18 48 L 18 26 Z"
          fill="url(#warnShieldGrad)"
          stroke="#450A0A"
          strokeWidth="1.5"
        />

        {/* Exclamation Symbol with 3D drop */}
        <Rect x="39" y="24" width="6" height="24" rx="3" fill="#FFFFFF" />
        <Circle cx="42" cy="56" r="3.8" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

// 🏆 Golden Celebration Trophy Vector (for Reward Claimed Modal)
export const CelebrationTrophyVector: React.FC<{ size?: number }> = ({ size = 96 }) => {
  return (
    <View style={{ width: size, height: size * 0.9, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size * 0.9} viewBox="0 0 96 86">
        <Defs>
          <SvgGradient id="trophyGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFF0A0" />
            <Stop offset="35%" stopColor="#FACC15" />
            <Stop offset="75%" stopColor="#EAB308" />
            <Stop offset="100%" stopColor="#A16207" />
          </SvgGradient>
          <SvgRadial id="trophyHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </SvgRadial>
        </Defs>

        <Circle cx="48" cy="43" r="40" fill="url(#trophyHalo)" />

        {/* Left & Right Handles */}
        <Path d="M 24 24 C 10 24, 10 48, 28 50" stroke="#CA8A04" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <Path d="M 72 24 C 86 24, 86 48, 68 50" stroke="#CA8A04" strokeWidth="4.5" fill="none" strokeLinecap="round" />

        {/* Trophy Body */}
        <Path
          d="M 26 16 L 70 16 C 70 42, 60 54, 51 58 L 51 68 L 60 68 L 62 74 L 34 74 L 36 68 L 45 68 L 45 58 C 36 54, 26 42, 26 16 Z"
          fill="url(#trophyGoldGrad)"
          stroke="#713F12"
          strokeWidth="2"
        />

        {/* Star Motif on Trophy */}
        <Path
          d="M 48 26 L 50 32 L 56 32 L 51 36 L 53 42 L 48 38 L 43 42 L 45 36 L 40 32 L 46 32 Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 5. POPUP 1: GAME PAUSED MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface GamePausedModalProps {
  visible: boolean;
  levelId: number;
  timeLeft: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled?: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHaptics?: () => void;
  onResume: () => void;
  onExit: () => void;
}

export const GamePausedModal: React.FC<GamePausedModalProps> = ({
  visible,
  levelId,
  timeLeft,
  soundEnabled,
  musicEnabled,
  hapticsEnabled = true,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
  onResume,
  onExit,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard ribbonTitle="GAME PAUSED">
            {/* Level Subtitle */}
            <Text style={styles.pausedSubtitle}>
              Level {levelId} • {formatMinutes(timeLeft)} Left
            </Text>

            {/* Settings Control Row */}
            <View style={styles.settingsRow}>
              {/* SFX Button */}
              <View style={styles.settingCol}>
                <Pressable
                  onPress={() => {
                    nativeAudio.playLetterTap(1);
                    nativeHaptics.selection();
                    onToggleSound();
                  }}
                  style={({ pressed }) => [styles.settingIconBtn, pressed && styles.btnPressed]}
                >
                  <LinearGradient
                    colors={soundEnabled ? ['#F472B6', '#C026D3'] : ['#64748B', '#475569']}
                    style={styles.settingIconGradient}
                  >
                    <MaterialIcons
                      name={soundEnabled ? 'volume-up' : 'volume-off'}
                      size={26}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </Pressable>
                <Text style={[styles.settingBtnLabel, { color: soundEnabled ? '#F472B6' : '#94A3B8' }]}>
                  {soundEnabled ? 'SFX ON' : 'SFX OFF'}
                </Text>
              </View>

              {/* BGM Button */}
              <View style={styles.settingCol}>
                <Pressable
                  onPress={() => {
                    nativeAudio.playLetterTap(1);
                    nativeHaptics.selection();
                    onToggleMusic();
                  }}
                  style={({ pressed }) => [styles.settingIconBtn, pressed && styles.btnPressed]}
                >
                  <LinearGradient
                    colors={musicEnabled ? ['#38BDF8', '#0284C7'] : ['#64748B', '#475569']}
                    style={styles.settingIconGradient}
                  >
                    <MaterialIcons
                      name={musicEnabled ? 'music-note' : 'music-off'}
                      size={26}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </Pressable>
                <Text style={[styles.settingBtnLabel, { color: musicEnabled ? '#38BDF8' : '#94A3B8' }]}>
                  {musicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}
                </Text>
              </View>

              {/* Vibration / Haptics Button */}
              <View style={styles.settingCol}>
                <Pressable
                  onPress={() => {
                    nativeAudio.playLetterTap(1);
                    if (onToggleHaptics) {
                      onToggleHaptics();
                    } else {
                      onToggleSound();
                    }
                  }}
                  style={({ pressed }) => [styles.settingIconBtn, pressed && styles.btnPressed]}
                >
                  <LinearGradient
                    colors={hapticsEnabled ? ['#F59E0B', '#D97706'] : ['#64748B', '#475569']}
                    style={styles.settingIconGradient}
                  >
                    <MaterialIcons
                      name={hapticsEnabled ? 'vibration' : 'mobile-off'}
                      size={26}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </Pressable>
                <Text style={[styles.settingBtnLabel, { color: hapticsEnabled ? '#F59E0B' : '#94A3B8' }]}>
                  {hapticsEnabled ? 'VIBE ON' : 'VIBE OFF'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionBtnStack}>
              <Game3DButton title="RESUME" variant="green" onPress={onResume} height={52} />
              <Game3DButton title="EXIT TO MAP" variant="purple" onPress={onExit} height={46} />
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 6. POPUP 2: COINS EARNED MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface CoinsEarnedModalProps {
  visible: boolean;
  coins: number;
  title?: string;
  onClose: () => void;
}

export const CoinsEarnedModal: React.FC<CoinsEarnedModalProps> = ({
  visible,
  coins,
  title = 'COINS EARNED!',
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      nativeAudio.playCoin();
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard ribbonTitle={title}>
            {/* Amount Subtitle */}
            <Text style={styles.coinsSubtitle}>+{coins} COINS</Text>

            {/* Overflowing Treasure Chest Vector Art */}
            <View style={styles.centerArtWrapper}>
              <TreasureChestVector size={160} />
            </View>

            {/* Awesome Button */}
            <View style={{ width: '100%', marginTop: 8 }}>
              <Game3DButton title="AWESOME!" variant="green" onPress={onClose} height={52} />
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 7. POPUP 3: REFILL HEARTS MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface RefillHeartsModalProps {
  visible: boolean;
  currentHearts: number;
  maxHearts: number;
  coinsCost?: number;
  userCoins: number;
  countdownText?: string;
  onClose: () => void;
  onRefill: () => void;
}

export const RefillHeartsModal: React.FC<RefillHeartsModalProps> = ({
  visible,
  currentHearts,
  maxHearts,
  coinsCost = 50,
  userCoins,
  countdownText,
  onClose,
  onRefill,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;
  const isFull = currentHearts >= maxHearts;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            topBadge={
              <View style={styles.heartBadgeAnchor}>
                <RubyHeartGem size={70} />
              </View>
            }
          >
            {/* Inset Heart Gauge Bar */}
            <View style={styles.heartGaugeCard}>
              <View style={styles.heartIconsRow}>
                {Array.from({ length: maxHearts }).map((_, idx) => (
                  <MaterialIcons
                    key={idx}
                    name="favorite"
                    size={28}
                    color={idx < currentHearts ? '#FB7185' : '#475569'}
                    style={idx < currentHearts ? styles.heartGlow : undefined}
                  />
                ))}
              </View>
              <Text style={styles.heartStatusText}>
                {isFull
                  ? `${maxHearts}/${maxHearts} Full`
                  : `${currentHearts}/${maxHearts} • Next in ${countdownText || '04:12'}`}
              </Text>
            </View>

            {/* Parchment Scroll Cost Box */}
            <View style={styles.parchmentScroll}>
              <Text style={styles.parchmentTitle}>Refill Cost:</Text>
              <View style={styles.parchmentPriceRow}>
                <MaterialIcons name="monetization-on" size={26} color="#F59E0B" />
                <Text style={styles.parchmentPriceText}>{coinsCost} Coins</Text>
              </View>
              <Text style={styles.parchmentBalanceText}>
                Your Coins: {userCoins.toLocaleString()}
              </Text>
            </View>

            {/* Two Action Buttons Side-by-Side */}
            <View style={styles.sideBySideBtnRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Game3DButton title="CLOSE" variant="gray" onPress={onClose} height={46} />
              </View>
              <View style={{ flex: 1.2, marginLeft: 6 }}>
                <Game3DButton
                  title={isFull ? `FULL (${maxHearts}/${maxHearts})` : `REFILL (${coinsCost} 🪙)`}
                  variant="blue"
                  disabled={isFull}
                  onPress={onRefill}
                  height={46}
                />
              </View>
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 8. POPUP 4: WORD FLAME STREAK MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface WordFlameStreakModalProps {
  visible: boolean;
  strike: number;
  milestoneProgress?: number; // 0.0 to 1.0
  isRestoring?: boolean;
  onKeepBurning: () => void;
  onRestore?: () => void;
  onClose?: () => void;
}

export const WordFlameStreakModal: React.FC<WordFlameStreakModalProps> = ({
  visible,
  strike,
  milestoneProgress = 0.65,
  isRestoring = false,
  onKeepBurning,
  onRestore,
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  const isAtZero = strike <= 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose || onKeepBurning}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle={isAtZero ? "REIGNITE STRIKE!" : "WORD FLAME STREAK!"}
            isFireRibbon={true}
          >
            {/* Top Close Button if onClose provided */}
            {onClose && (
              <Pressable
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.flameCloseCornerBtn}
              >
                <MaterialIcons name="close" size={18} color="#94A3B8" />
              </Pressable>
            )}

            {/* Center Mascot Flame in Bowl */}
            <View style={[styles.centerArtWrapper, { marginTop: 10 }]}>
              <FlameMascotVector size={110} />
            </View>

            {/* Big Golden Streak Count */}
            <Text style={styles.flameStreakNumber}>{strike}x</Text>
            <Text style={styles.flameStreakBurning}>
              {isAtZero ? 'FLAME EXTINGUISHED' : 'BURNING'}
            </Text>

            {/* Milestone Thermometer & Progress Bar */}
            <View style={styles.milestoneBlock}>
              <Text style={styles.milestoneTitle}>Milestone</Text>
              <View style={styles.thermoBarRow}>
                {/* Thermometer Icon */}
                <MaterialIcons name="thermostat" size={26} color="#EF4444" style={{ marginRight: 4 }} />
                {/* Progress Track */}
                <View style={styles.thermoTrack}>
                  <LinearGradient
                    colors={['#EF4444', '#F97316', '#FDE047']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.thermoFill, { width: `${Math.round(milestoneProgress * 100)}%` }]}
                  />
                </View>
              </View>
            </View>

            {/* Rules & Lifelines Info */}
            <View style={styles.streakRulesCard}>
              <Text style={styles.streakRuleLine}>
                <Text style={{ color: '#4ADE80', fontWeight: '900' }}>+10</Text> per win /{' '}
                <Text style={{ color: '#EF4444', fontWeight: '900' }}>-10</Text> on timeout
              </Text>
              <View style={styles.shieldRow}>
                <MaterialIcons name="shield" size={16} color="#38BDF8" style={{ marginRight: 4 }} />
                <Text style={styles.shieldText}>2 Shield Lifelines</Text>
              </View>
            </View>

            {/* Fiery Action Button */}
            <View style={{ width: '100%', marginTop: 8 }}>
              <Game3DButton
                title={
                  isAtZero
                    ? (isRestoring ? 'RESTORING...' : 'WATCH AD TO RESTORE 🔥')
                    : 'KEEP BURNING!'
                }
                variant="fire"
                disabled={isRestoring}
                onPress={isAtZero && onRestore ? onRestore : onKeepBurning}
                height={52}
                icon="local-fire-department"
              />
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 9. POPUP 5: GAME OVER / TIME-OUT MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface GameOverModalProps {
  visible: boolean;
  levelId: number;
  strike: number;
  strikeLost: number;
  isRestoringStrike?: boolean;
  lossScaleAnim?: Animated.Value;
  lossShakeAnim?: Animated.Value;
  lossHeartAnim?: Animated.Value;
  lossStrikeAnim?: Animated.Value;
  floatMinusOneAnim?: Animated.Value;
  floatMinusOneY?: Animated.AnimatedInterpolation<number> | Animated.Value;
  onRetry: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  levelId,
  strike,
  strikeLost,
  isRestoringStrike = false,
  lossScaleAnim,
  lossShakeAnim,
  lossHeartAnim,
  lossStrikeAnim,
  floatMinusOneAnim,
  floatMinusOneY,
  onRetry,
  onExit,
}) => {
  const localScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible && !lossScaleAnim) {
      localScale.setValue(0.7);
      Animated.spring(localScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
    }
  }, [visible, lossScaleAnim, localScale]);

  const scale = lossScaleAnim || localScale;
  const shake = lossShakeAnim ? [{ translateX: lossShakeAnim }] : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onExit}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={[{ transform: [{ scale }, ...shake] }]}>
          <WoodenPopupCard
            ribbonTitle="TIME'S UP! ⏰"
            ribbonVariant="red"
            cardGradient={['#580E14', '#38060A', '#1C0204']}
            innerBorderColor="#EF4444"
          >
            {/* Subtitle */}
            <Text style={styles.gameOverSubtitle}>Level {levelId} Failed</Text>

            {/* Broken Heart Art */}
            <View style={[styles.centerArtWrapper, { marginVertical: 4 }]}>
              <BrokenHeartClockVector size={86} />
            </View>

            {/* Loss Badges: -1 Heart & Strike Penalty */}
            <View style={styles.lossBadgesRow}>
              {/* -1 Heart Badge */}
              <Animated.View
                style={[
                  styles.lossBadgeBox,
                  {
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FCA5A5',
                    transform: lossHeartAnim
                      ? [
                          { scale: lossHeartAnim },
                          {
                            translateY: lossHeartAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [12, 0],
                            }),
                          },
                        ]
                      : [],
                  },
                ]}
              >
                {floatMinusOneAnim && floatMinusOneY && (
                  <Animated.View
                    style={[
                      styles.floatingMinusBadge,
                      {
                        opacity: floatMinusOneAnim.interpolate({
                          inputRange: [0, 0.2, 0.8, 1],
                          outputRange: [0, 1, 1, 0],
                        }),
                        transform: [{ translateY: floatMinusOneY }],
                      },
                    ]}
                  >
                    <Text style={styles.floatingMinusText}>-1 ❤️</Text>
                  </Animated.View>
                )}
                <MaterialIcons name="favorite" size={24} color="#DC2626" />
                <Text style={styles.lossBadgeValue}>-1 Heart</Text>
                <Text style={styles.lossBadgeLabel}>LIFE LOST</Text>
              </Animated.View>

              {/* Strike Penalty Badge */}
              <Animated.View
                style={[
                  styles.lossBadgeBox,
                  {
                    backgroundColor: '#FFF7ED',
                    borderColor: '#FDBA74',
                    transform: lossStrikeAnim
                      ? [
                          { scale: lossStrikeAnim },
                          {
                            translateY: lossStrikeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [12, 0],
                            }),
                          },
                        ]
                      : [],
                  },
                ]}
              >
                <MaterialIcons name="whatshot" size={24} color="#EA580C" />
                <Text style={[styles.lossBadgeValue, { color: '#EA580C' }]}>-{strikeLost} 🔥</Text>
                <Text style={[styles.lossBadgeLabel, { color: '#C2410C' }]}>STRIKE LOST</Text>
              </Animated.View>
            </View>

            {/* Strike Remaining Pill */}
            <View style={styles.strikeRemainingPill}>
              <MaterialIcons name="local-fire-department" size={16} color="#FB923C" style={{ marginRight: 4 }} />
              <Text style={styles.strikeRemainingText}>Strike remaining: {strike} 🔥</Text>
            </View>

            {/* Action Buttons */}
            <View style={{ width: '100%', marginTop: 8 }}>
              <Game3DButton
                title={
                  isRestoringStrike
                    ? 'LOADING AD…'
                    : strike <= 0
                    ? 'WATCH AD TO RESTORE 🔥 & RETRY'
                    : 'TRY AGAIN'
                }
                variant={strike <= 0 ? 'fire' : 'green'}
                disabled={isRestoringStrike}
                onPress={onRetry}
                height={50}
                icon={strike <= 0 ? 'local-fire-department' : 'replay'}
              />
            </View>

            <View style={{ width: '100%', marginTop: 8 }}>
              <Game3DButton
                title="EXIT TO MAP"
                variant="purple"
                disabled={isRestoringStrike}
                onPress={onExit}
                height={46}
                icon="map"
              />
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 10. POPUP 6: LEVEL INFO / LEVEL SELECT MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface LevelInfoModalProps {
  visible: boolean;
  levelId: number | null;
  isOcean?: boolean;
  maskIcon?: string;
  maskName?: string;
  difficultyConfig?: {
    step?: number;
    titleBadge?: string;
    hardness?: number;
  } | null;
  onClose: () => void;
  onStartLevel: (levelId: number) => void;
}

export const LevelInfoModal: React.FC<LevelInfoModalProps> = ({
  visible,
  levelId,
  isOcean = false,
  maskIcon,
  maskName,
  difficultyConfig,
  onClose,
  onStartLevel,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible || levelId === null) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle={`LEVEL ${levelId}`}
            ribbonVariant={isOcean ? 'ocean' : 'emerald'}
            cardGradient={
              isOcean
                ? (['#0C4A6E', '#082F49', '#031726'] as const)
                : (['#064E3B', '#022C22', '#031913'] as const)
            }
            innerBorderColor={isOcean ? '#38BDF8' : '#34D399'}
          >
            {/* Chapter Subtitle & Mask Info */}
            <Text style={styles.levelInfoSubtitle}>
              {isOcean
                ? `Chapter 2 • Bubble Ocean ${maskIcon ? `(${maskIcon} ${maskName || ''})` : ''}`
                : `Chapter 1 • Sunny Valley ${maskIcon ? `(${maskIcon} ${maskName || ''})` : ''}`}
            </Text>

            {/* Difficulty Badge */}
            {difficultyConfig && (
              <View style={styles.levelDifficultyBadge}>
                <Text style={styles.levelDifficultyText}>
                  {difficultyConfig.titleBadge || 'Challenge'} • Hardness: {(difficultyConfig.hardness || 1).toFixed(1)}
                </Text>
              </View>
            )}

            {/* Objective Parchment Box */}
            <View style={styles.objectiveBox}>
              <Text style={styles.objectiveHeader}>✦ OBJECTIVE ✦</Text>
              <Text style={styles.objectiveText}>
                Find all hidden words on the matrix to earn 3 Stars and 50 Coins!
              </Text>
              <View style={styles.objectiveStarsRow}>
                <MaterialIcons name="star" size={26} color="#F59E0B" />
                <MaterialIcons name="star" size={32} color="#FBBF24" style={{ marginHorizontal: 4 }} />
                <MaterialIcons name="star" size={26} color="#F59E0B" />
              </View>
            </View>

            {/* Side-by-Side Action Buttons */}
            <View style={styles.sideBySideBtnRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Game3DButton title="CANCEL" variant="gray" onPress={onClose} height={48} />
              </View>
              <View style={{ flex: 1.4, marginLeft: 6 }}>
                <Game3DButton
                  title="PLAY (1 ❤️)"
                  variant={isOcean ? 'blue' : 'green'}
                  icon="favorite"
                  onPress={() => onStartLevel(levelId)}
                  height={48}
                />
              </View>
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 11. POPUP 7: 7-DAY LOGIN REWARDS CALENDAR MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface DailyCalendarModalProps {
  visible: boolean;
  claimedDays: number[];
  canClaimToday: boolean;
  currentDayToClaim: number;
  dailyRewards: Array<{
    day: number;
    coins: number;
    rewardText: string;
    isJackpot?: boolean;
  }>;
  onClaim: (day: number) => void;
  onClose: () => void;
}

export const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({
  visible,
  claimedDays,
  canClaimToday,
  currentDayToClaim,
  dailyRewards,
  onClaim,
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle="7-DAY REWARDS 🎁"
            ribbonVariant="gold"
            cardGradient={['#3B1454', '#250838', '#140320']}
            innerBorderColor="#FBBF24"
            maxWidth={345}
          >
            {/* Top Close Button */}
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.flameCloseCornerBtn}
            >
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </Pressable>

            {/* Subtitle */}
            <Text style={styles.pausedSubtitle}>
              Day {currentDayToClaim} of 7 • {canClaimToday ? 'Tap Claim to collect!' : 'Reward claimed for today!'}
            </Text>

            {/* 6-Day Grid (2 rows x 3 columns) */}
            <View style={styles.calendarGrid}>
              {dailyRewards.slice(0, 6).map((reward) => {
                const isClaimed = claimedDays.includes(reward.day);
                const isReady = canClaimToday && reward.day === currentDayToClaim;

                return (
                  <View
                    key={reward.day}
                    style={[
                      styles.calendarDayTile,
                      isReady && styles.calendarDayTileReady,
                      isClaimed && styles.calendarDayTileClaimed,
                    ]}
                  >
                    <Text style={styles.calendarDayTileNum}>DAY {reward.day}</Text>
                    <MaterialIcons
                      name="monetization-on"
                      size={20}
                      color={isReady ? '#10B981' : isClaimed ? '#64748B' : '#F59E0B'}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.calendarDayRewardText, isReady && { color: '#4ADE80' }]}
                    >
                      +{reward.coins}
                    </Text>

                    {isClaimed ? (
                      <View style={styles.calendarClaimedBadge}>
                        <Text style={styles.calendarClaimedBadgeText}>✓</Text>
                      </View>
                    ) : isReady ? (
                      <Pressable
                        onPress={() => onClaim(reward.day)}
                        style={styles.calendarClaimMiniBtn}
                      >
                        <Text style={styles.calendarClaimMiniText}>CLAIM</Text>
                      </Pressable>
                    ) : (
                      <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '800' }}>🔒</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Day 7 Mega Jackpot Card */}
            {(() => {
              const day7 = dailyRewards[6] || { day: 7, coins: 200, rewardText: 'Super Jackpot' };
              const isClaimed = claimedDays.includes(day7.day);
              const isReady = canClaimToday && day7.day === currentDayToClaim;

              return (
                <View
                  style={[
                    styles.calendarDay7Card,
                    isReady && styles.calendarDayTileReady,
                    isClaimed && styles.calendarDayTileClaimed,
                  ]}
                >
                  <MaterialIcons
                    name="card-giftcard"
                    size={28}
                    color={isReady ? '#FDE047' : isClaimed ? '#64748B' : '#F59E0B'}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.calendarDay7Title}>DAY 7 MEGA JACKPOT 👑</Text>
                    <Text style={styles.calendarDay7Sub}>{day7.rewardText}</Text>
                  </View>
                  {isClaimed ? (
                    <View style={styles.calendarClaimedBadge}>
                      <Text style={styles.calendarClaimedBadgeText}>✓ CLAIMED</Text>
                    </View>
                  ) : isReady ? (
                    <Pressable
                      onPress={() => onClaim(day7.day)}
                      style={styles.calendarClaimMiniBtn}
                    >
                      <Text style={styles.calendarClaimMiniText}>CLAIM</Text>
                    </Pressable>
                  ) : (
                    <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '800' }}>🔒 LOCKED</Text>
                  )}
                </View>
              );
            })()}

            {/* Bottom Juicy Action Button */}
            <View style={{ width: '100%', marginTop: 8 }}>
              {canClaimToday ? (
                <Game3DButton
                  title={`CLAIM DAY ${currentDayToClaim} 🎁`}
                  variant="green"
                  onPress={() => onClaim(currentDayToClaim)}
                  height={50}
                  icon="card-giftcard"
                />
              ) : (
                <Game3DButton title="CLOSE" variant="gray" onPress={onClose} height={46} />
              )}
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 12. POPUP 8: REWARD CLAIMED MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface RewardClaimedModalProps {
  visible: boolean;
  message: string;
  title?: string;
  onClose: () => void;
}

export const RewardClaimedModal: React.FC<RewardClaimedModalProps> = ({
  visible,
  message,
  title = 'REWARD CLAIMED! 🎉',
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      nativeAudio.playVictory();
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle={title}
            ribbonVariant="gold"
            cardGradient={['#2B1055', '#1B0836', '#0F0321']}
            innerBorderColor="#FBBF24"
          >
            {/* Center Trophy Vector */}
            <View style={[styles.centerArtWrapper, { marginVertical: 6 }]}>
              <CelebrationTrophyVector size={92} />
            </View>

            {/* Parchment Message Box */}
            <View style={styles.claimedMsgParchment}>
              <Text style={styles.claimedMsgText}>{message}</Text>
            </View>

            {/* Awesome Button */}
            <View style={{ width: '100%', marginTop: 8 }}>
              <Game3DButton title="AWESOME!" variant="green" onPress={onClose} height={50} />
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 13. POPUP 9: FREE COINS REWARDED AD MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface FreeCoinsModalProps {
  visible: boolean;
  rewardAmount: number;
  userCoins: number;
  onWatchAd: () => void;
  onClose: () => void;
}

export const FreeCoinsModal: React.FC<FreeCoinsModalProps> = ({
  visible,
  rewardAmount,
  userCoins,
  onWatchAd,
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle="GET FREE COINS! 🪙"
            ribbonVariant="gold"
            cardGradient={['#4D2604', '#321601', '#1A0B00']}
            innerBorderColor="#FACC15"
          >
            {/* Top Close Button */}
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.flameCloseCornerBtn}
            >
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </Pressable>

            {/* Subtitle */}
            <Text style={styles.freeCoinsSubtitle}>
              Watch a short video ad to earn free coins for hints, lifelines & reveals!
            </Text>

            {/* Center Art: Treasure Chest */}
            <View style={[styles.centerArtWrapper, { marginVertical: 4 }]}>
              <TreasureChestVector size={130} />
            </View>

            {/* Parchment Scroll Cost/Reward Box */}
            <View style={styles.parchmentScroll}>
              <Text style={styles.parchmentTitle}>REWARD:</Text>
              <View style={styles.parchmentPriceRow}>
                <MaterialIcons name="monetization-on" size={26} color="#F59E0B" />
                <Text style={styles.parchmentPriceText}>+{rewardAmount} Coins</Text>
              </View>
              <Text style={styles.parchmentBalanceText}>
                Your Balance: {userCoins.toLocaleString()}
              </Text>
            </View>

            {/* Side-by-Side Action Buttons */}
            <View style={styles.sideBySideBtnRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Game3DButton title="CANCEL" variant="gray" onPress={onClose} height={48} />
              </View>
              <View style={{ flex: 1.4, marginLeft: 6 }}>
                <Game3DButton
                  title="WATCH AD 🎬"
                  variant="green"
                  onPress={onWatchAd}
                  height={48}
                />
              </View>
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 14. POPUP 10: RESET PROGRESS CONFIRMATION MODAL
// ══════════════════════════════════════════════════════════════════════════════
export interface ResetConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  visible,
  onConfirm,
  onClose,
}) => {
  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popScale.setValue(0.7);
      Animated.spring(popScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <WoodenPopupCard
            ribbonTitle="RESET PROGRESS?"
            ribbonVariant="red"
            cardGradient={['#450A0A', '#2B0404', '#150101']}
            innerBorderColor="#EF4444"
          >
            {/* Warning Shield Art */}
            <View style={[styles.centerArtWrapper, { marginVertical: 6 }]}>
              <WarningHazardVector size={76} />
            </View>

            {/* Warning Parchment Box */}
            <View style={styles.warningParchment}>
              <Text style={styles.warningParchmentTitle}>⚠️ DANGER ZONE</Text>
              <Text style={styles.warningParchmentText}>
                This will permanently erase all your game progress, stars, levels, and word streaks.
              </Text>
              <Text style={[styles.warningParchmentText, { marginTop: 4, fontWeight: '800', color: '#991B1B' }]}>
                Are you sure you want to start over?
              </Text>
            </View>

            {/* Action Buttons: Keep Playing (safe) & Reset (danger) */}
            <View style={styles.sideBySideBtnRow}>
              <View style={{ flex: 1.2, marginRight: 6 }}>
                <Game3DButton title="KEEP PLAYING" variant="green" onPress={onClose} height={48} />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Game3DButton title="RESET" variant="red" onPress={onConfirm} height={48} />
              </View>
            </View>
          </WoodenPopupCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STYLESHEET
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  flameCloseCornerBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 20,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Wooden Outer Bezel Frame
  woodenOuterBezel: {
    backgroundColor: '#3B1A0A',
    borderRadius: 28,
    padding: 7,
    borderWidth: 2.5,
    borderColor: '#78350F',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    alignItems: 'center',
  },
  woodGrainRim: {
    width: '100%',
    backgroundColor: '#6F3514',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#8B4513',
  },
  innerSapphireCard: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerCyanBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  woodenCardContent: {
    width: '100%',
    alignItems: 'center',
  },
  topBadgeWrapper: {
    position: 'absolute',
    top: -36,
    zIndex: 10,
  },
  heartBadgeAnchor: {
    shadowColor: '#BE123C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  ribbonAnchor: {
    position: 'absolute',
    top: -22,
    zIndex: 10,
  },

  // Ribbon Styles
  ribbonContainer: {
    alignItems: 'center',
  },
  ribbonFlameCrest: {
    position: 'absolute',
    top: -16,
    zIndex: 1,
  },
  ribbonSvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonTextContainer: {
    position: 'absolute',
    top: 14,
    left: 40,
    right: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFDF2',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  // 3D Juicy Button Styles
  btnWrapper: {
    width: '100%',
    position: 'relative',
    marginVertical: 4,
  },
  btnLip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  btnBody: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  btnHighlight: {
    position: 'absolute',
    top: 3,
    left: '12%',
    right: '12%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fireGlow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },

  // Popup 1 (Game Paused)
  pausedSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E0E7FF',
    marginTop: 2,
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  settingCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingBtnLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  settingIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  settingIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPillTrack: {
    width: 58,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    elevation: 4,
  },
  switchGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFDF2',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  actionBtnStack: {
    width: '100%',
    marginTop: 8,
    gap: 4,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  // Popup 2 (Coins Earned)
  coinsSubtitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE047',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  centerArtWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  chestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestStarsWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Popup 3 (Refill Hearts)
  heartGaugeCard: {
    width: '100%',
    backgroundColor: '#0F1E38',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  heartIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heartGlow: {
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  heartStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#CBD5E1',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  parchmentScroll: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  parchmentTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.5,
  },
  parchmentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 6,
  },
  parchmentPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#451A03',
  },
  parchmentBalanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  sideBySideBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  // Popup 4 (Word Flame Streak)
  flameStreakNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 0.8,
    marginTop: -4,
    textShadowColor: '#78350F',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  flameStreakBurning: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FB923C',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  milestoneBlock: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  thermoBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  thermoTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#0F1E38',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  thermoFill: {
    height: '100%',
    borderRadius: 6,
  },
  streakRulesCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 30, 56, 0.7)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  streakRuleLine: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  shieldText: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '800',
  },
  // Game Over Styles
  gameOverSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FECACA',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: '#450A0A',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lossBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginVertical: 4,
  },
  lossBadgeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    position: 'relative',
    elevation: 3,
  },
  floatingMinusBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  floatingMinusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  lossBadgeValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  lossBadgeLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  strikeRemainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(67, 20, 7, 0.75)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  strikeRemainingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FED7AA',
  },
  // Level Info Styles
  levelInfoSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: '#0F172A',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelDifficultyBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  levelDifficultyText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 0.5,
  },
  objectiveBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 6,
    elevation: 3,
  },
  objectiveHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  objectiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 17,
  },
  objectiveStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  // 7-Day Calendar Styles
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 6,
    gap: 6,
  },
  calendarDayTile: {
    width: '31%',
    backgroundColor: 'rgba(30, 11, 51, 0.75)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayTileReady: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    elevation: 4,
  },
  calendarDayTileClaimed: {
    borderColor: 'rgba(100, 116, 139, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    opacity: 0.7,
  },
  calendarDayTileNum: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FDE047',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  calendarDayRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 4,
  },
  calendarClaimMiniBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    elevation: 2,
  },
  calendarClaimMiniText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calendarClaimedBadge: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  calendarClaimedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calendarDay7Card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  calendarDay7Title: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 0.5,
  },
  calendarDay7Sub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCD34D',
  },
  // Claimed Msg & Warning Parchments
  claimedMsgParchment: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3,
  },
  claimedMsgText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 20,
  },
  warningParchment: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3,
  },
  warningParchmentTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  warningParchmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 17,
  },
  freeCoinsSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF08A',
    textAlign: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
    lineHeight: 16,
    textShadowColor: '#451A03',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});


export { VictoryModal } from './VictoryModal';
export type { VictoryModalProps } from './VictoryModal';
