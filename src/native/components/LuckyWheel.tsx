import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { nativeAudio } from '../audio';
import { CustomAlert } from './CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface WheelPrize {
  id: number;
  label: string;
  subLabel: string;
  icon: string;
  type: 'coins' | 'hints';
  amount: number;
  bgColor: string;
  accentColor: string;
}

const PRIZES: WheelPrize[] = [
  { id: 0, label: '+50', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 50, bgColor: '#2E1065', accentColor: '#FFD700' },
  { id: 1, label: '+2', subLabel: 'Hints', icon: '💡', type: 'hints', amount: 2, bgColor: '#B45309', accentColor: '#FEF08A' },
  { id: 2, label: '+100', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 100, bgColor: '#5B21B6', accentColor: '#FFD700' },
  { id: 3, label: '+1', subLabel: 'Hint', icon: '💡', type: 'hints', amount: 1, bgColor: '#D97706', accentColor: '#FEF08A' },
  { id: 4, label: '+25', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 25, bgColor: '#3B0764', accentColor: '#FDE68A' },
  { id: 5, label: '+3', subLabel: 'Hints', icon: '💡', type: 'hints', amount: 3, bgColor: '#7C3AED', accentColor: '#E9D5FF' },
  { id: 6, label: '+250', subLabel: 'Jackpot', icon: '💎', type: 'coins', amount: 250, bgColor: '#4C1D95', accentColor: '#FDE047' },
  { id: 7, label: '+75', subLabel: 'Coins', icon: '🪙', type: 'coins', amount: 75, bgColor: '#0F766E', accentColor: '#99F6E4' },
];

const NUM_SLICES = PRIZES.length;
const SLICE_ANGLE = (2 * Math.PI) / NUM_SLICES; // 45 deg in rad
const SLICE_DEG = 360 / NUM_SLICES; // 45 deg
const WHEEL_RADIUS = 108;
const WHEEL_CENTER = 110;
const SVG_SIZE = 220;

// Precompute 16 LED stud positions for outer frame
const NUM_STUDS = 16;
const STUD_RADIUS = 120;
const STUDS = Array.from({ length: NUM_STUDS }).map((_, i) => {
  const angle = (i * 2 * Math.PI) / NUM_STUDS;
  return {
    x: 128 + STUD_RADIUS * Math.cos(angle),
    y: 128 + STUD_RADIUS * Math.sin(angle),
    isGold: i % 2 === 0,
  };
});

interface LuckyWheelProps {
  onAddCoins: (amount: number) => void;
  onAddHints: (amount: number) => void;
  canSpinToday?: boolean;
  onRecordSpin?: () => void;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  onAddCoins,
  onAddHints,
  canSpinToday = true,
  onRecordSpin,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);

  // Rotation value in degrees
  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef<number>(0);
  const needleWobbleAnim = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const [showAlreadySpunAlert, setShowAlreadySpunAlert] = useState(false);

  const handleSpin = () => {
    if (isSpinning) return;
    if (!canSpinToday) {
      setShowAlreadySpunAlert(true);
      return;
    }
    setIsSpinning(true);
    setWonPrize(null);
    bannerScale.setValue(0);
    nativeAudio.playSparkle();

    // Pick winning prize
    const winnerIndex = Math.floor(Math.random() * NUM_SLICES);
    const winningPrize = PRIZES[winnerIndex];

    // Math for landing exact slice under top pointer (pointer at 270 deg / 12 o'clock)
    // Slice i midpoint = i * 45 + 22.5
    const sliceMidDeg = winnerIndex * SLICE_DEG + SLICE_DEG / 2;
    // We want: (sliceMidDeg + targetAngle) % 360 = 270
    // => targetAngleOffset = (270 - sliceMidDeg) mod 360
    const targetAngleOffset = ((270 - sliceMidDeg) % 360 + 360) % 360;

    // Minimum 5 full rotations (1800 deg) plus target offset from current rotation
    const baseRot = Math.ceil(currentRotation.current / 360) * 360;
    const finalAngle = baseRot + 1800 + targetAngleOffset;

    // Start needle tick wobbling
    const needleWobble = Animated.loop(
      Animated.sequence([
        Animated.timing(needleWobbleAnim, { toValue: -8, duration: 65, useNativeDriver: true }),
        Animated.timing(needleWobbleAnim, { toValue: 8, duration: 65, useNativeDriver: true }),
      ])
    );
    needleWobble.start();

    // Wheel spin animation
    Animated.timing(spinAnim, {
      toValue: finalAngle,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      needleWobble.stop();
      needleWobbleAnim.setValue(0);
      currentRotation.current = finalAngle % 360;
      setIsSpinning(false);
      setWonPrize(winningPrize);
      nativeAudio.playVictory();

      // Award the prize
      if (winningPrize.type === 'coins') {
        onAddCoins(winningPrize.amount);
      } else if (winningPrize.type === 'hints') {
        onAddHints(winningPrize.amount);
      }

      // Record daily spin completed for today
      onRecordSpin?.();

      // Banner pop-in
      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });
  };

  const spinDegrees = spinAnim.interpolate({
    inputRange: [0, 36000],
    outputRange: ['0deg', '36000deg'],
  });

  const needleRotate = needleWobbleAnim.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header with Royal Sparkle */}
      <View style={styles.headerRow}>
        <MaterialIcons name="auto-awesome" size={20} color="#FFD700" />
        <Text style={styles.title}>ROYAL LUCKY WHEEL</Text>
        <MaterialIcons name="auto-awesome" size={20} color="#FFD700" />
      </View>
      <Text style={styles.subtitle}>Spin daily for free bonus coins and hints!</Text>

      {/* Main Wheel Bezel Container */}
      <View style={styles.outerBezel}>
        {/* Decorative Studded Lights along the rim */}
        {STUDS.map((stud, idx) => (
          <View
            key={`stud-${idx}`}
            style={[
              styles.studDot,
              {
                left: stud.x - 5,
                top: stud.y - 5,
                backgroundColor: stud.isGold ? '#FFD700' : '#FFFFFF',
                shadowColor: stud.isGold ? '#FFD700' : '#FFFFFF',
              },
            ]}
          />
        ))}

        {/* Rotating SVG Wheel */}
        <Animated.View style={[styles.wheelContainer, { transform: [{ rotate: spinDegrees }] }]}>
          <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
            <Defs>
              <SvgGradient id="goldRimGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFD700" />
                <Stop offset="0.5" stopColor="#F59E0B" />
                <Stop offset="1" stopColor="#D97706" />
              </SvgGradient>
            </Defs>

            {/* Render 8 Pizza Wedges */}
            {PRIZES.map((prize, idx) => {
              const startAngle = idx * SLICE_ANGLE;
              const endAngle = (idx + 1) * SLICE_ANGLE;

              const x1 = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(startAngle);
              const y1 = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(startAngle);
              const x2 = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(endAngle);
              const y2 = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(endAngle);

              const pathData = `M ${WHEEL_CENTER} ${WHEEL_CENTER} L ${x1} ${y1} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 0 1 ${x2} ${y2} Z`;

              // Mid angle for radial text placement
              const midAngle = startAngle + SLICE_ANGLE / 2;
              const textRadius = WHEEL_RADIUS * 0.64;
              const textX = WHEEL_CENTER + textRadius * Math.cos(midAngle);
              const textY = WHEEL_CENTER + textRadius * Math.sin(midAngle);
              const rotDeg = (midAngle * 180) / Math.PI + 90;

              return (
                <G key={prize.id}>
                  {/* Wedge Slice */}
                  <Path d={pathData} fill={prize.bgColor} />
                  {/* Golden separator line */}
                  <Path
                    d={`M ${WHEEL_CENTER} ${WHEEL_CENTER} L ${x1} ${y1}`}
                    stroke="#FFD700"
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                  />

                  {/* Radial Prize Label & Icon */}
                  <G transform={`rotate(${rotDeg}, ${textX}, ${textY})`}>
                    <SvgText
                      x={textX}
                      y={textY - 6}
                      fill="#FFFFFF"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {prize.label}
                    </SvgText>
                    <SvgText
                      x={textX}
                      y={textY + 10}
                      fill={prize.accentColor}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {prize.icon} {prize.subLabel}
                    </SvgText>
                  </G>
                </G>
              );
            })}

            {/* Inner Golden Border Ring */}
            <Circle
              cx={WHEEL_CENTER}
              cy={WHEEL_CENTER}
              r={WHEEL_RADIUS}
              stroke="url(#goldRimGrad)"
              strokeWidth="4"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Center 3D Hub (Loki Violet + Golden Crown) */}
        <View style={styles.centerHub}>
          <LinearGradient
            colors={['#FFD700', '#F59E0B', '#D97706']}
            style={styles.centerHubRing}
          >
            <View style={styles.centerHubInner}>
              <MaterialIcons name="auto-awesome" size={24} color="#FFD700" />
            </View>
          </LinearGradient>
        </View>

        {/* 3D Top Pointer Stopper Needle (pointing down at 12 o'clock) */}
        <Animated.View style={[styles.pointerWrapper, { transform: [{ rotate: needleRotate }] }]}>
          <Svg width={34} height={42} viewBox="0 0 34 42">
            <Defs>
              <SvgGradient id="pointerGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFBEB" />
                <Stop offset="0.3" stopColor="#FFD700" />
                <Stop offset="1" stopColor="#B45309" />
              </SvgGradient>
            </Defs>
            {/* 3D Downward Pointer Arrow */}
            <Polygon points="17,38 4,12 30,12" fill="url(#pointerGrad)" stroke="#78350F" strokeWidth="1.5" />
            {/* Top Ruby/Amethyst Jewel Pivot */}
            <Circle cx="17" cy="12" r="9" fill="#7C3AED" stroke="#FFD700" strokeWidth="2.5" />
            <Circle cx="17" cy="12" r="4.5" fill="#C084FC" />
          </Svg>
        </Animated.View>
      </View>

      {/* Daily Limit Notice when already spun today */}
      {!canSpinToday && !wonPrize && (
        <View style={styles.alreadySpunBadge}>
          <MaterialIcons name="event-available" size={18} color="#FFD700" />
          <Text style={styles.alreadySpunText}>Spun for today! Next spin available tomorrow.</Text>
        </View>
      )}

      {/* Won Prize Celebration Banner */}
      {wonPrize && (
        <Animated.View style={[styles.wonBanner, { transform: [{ scale: bannerScale }] }]}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            style={styles.wonBannerGradient}
          >
            <MaterialIcons name="celebration" size={20} color="#D97706" />
            <Text style={styles.wonText}>
              You Won: <Text style={styles.wonPrizeHighlight}>{wonPrize.label} {wonPrize.subLabel}!</Text>
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* 3D Spin Action Button */}
      <Pressable
        onPress={handleSpin}
        disabled={isSpinning || !canSpinToday}
        style={({ pressed }) => [
          styles.spinBtnWrapper,
          pressed && !isSpinning && canSpinToday && styles.pressedBtn,
          (isSpinning || !canSpinToday) && styles.disabledBtn,
        ]}
      >
        <LinearGradient
          colors={
            !canSpinToday
              ? ['#4C1D95', '#3B0764', '#2E1065']
              : ['#FFD700', '#F59E0B', '#D97706']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.spinBtnGradient}
        >
          <MaterialIcons
            name={!canSpinToday ? 'check-circle' : 'casino'}
            size={22}
            color={!canSpinToday ? '#C4B5FD' : '#451A03'}
          />
          <Text
            style={[
              styles.spinBtnText,
              !canSpinToday && { color: '#E9D5FF' },
            ]}
          >
            {isSpinning
              ? 'SPINNING...'
              : !canSpinToday
              ? 'SPUN TODAY ✓'
              : 'SPIN WHEEL'}
          </Text>
        </LinearGradient>
        <View
          style={[
            styles.spinBtnBevel,
            !canSpinToday && { backgroundColor: '#1E0B40' },
          ]}
        />
      </Pressable>

      <CustomAlert
        visible={showAlreadySpunAlert}
        title="ALREADY SPUN TODAY"
        message="You have already claimed your Lucky Spin for today.\n\n• Come back tomorrow for your next free spin!"
        icon="auto-awesome"
        btnText="GOT IT"
        onClose={() => setShowAlreadySpunAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E0B40', // Loki Deep Violet
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    padding: 20,
    marginTop: 18,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700', // Gold
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#DDD6FE',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },

  /* Outer Bezel with LED Studs */
  outerBezel: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#2E1065',
    borderWidth: 5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    marginBottom: 20,
  },
  studDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  wheelContainer: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    borderRadius: SVG_SIZE / 2,
    overflow: 'hidden',
  },

  /* Center Hub */
  centerHub: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    zIndex: 10,
    elevation: 10,
  },
  centerHubRing: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHubInner: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
    backgroundColor: '#1E0B40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  /* Top Needle Pointer */
  pointerWrapper: {
    position: 'absolute',
    top: -12,
    zIndex: 20,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },

  /* Won Prize Celebration Banner */
  wonBanner: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    elevation: 6,
  },
  wonBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  wonText: {
    color: '#78350F',
    fontWeight: '800',
    fontSize: 14,
  },
  wonPrizeHighlight: {
    color: '#B45309',
    fontWeight: '900',
  },

  /* 3D Spin Action Button */
  spinBtnWrapper: {
    width: '100%',
    position: 'relative',
  },
  spinBtnGradient: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  spinBtnText: {
    color: '#451A03',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  spinBtnBevel: {
    position: 'absolute',
    bottom: -3,
    left: '4%',
    width: '92%',
    height: 6,
    backgroundColor: '#B45309',
    borderRadius: 12,
    zIndex: -1,
  },
  pressedBtn: {
    transform: [{ scale: 0.97 }],
  },
  disabledBtn: {
    opacity: 0.85,
  },
  alreadySpunBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
  },
  alreadySpunText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
});
