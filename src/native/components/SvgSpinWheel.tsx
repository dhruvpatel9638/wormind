import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, G, Text as SvgText, Circle, Polygon } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';

export interface WheelSegmentData {
  label: string;
  prize: string;
  color: string;
  icon: string;
}

export const WHEEL_SEGMENTS: WheelSegmentData[] = [
  { label: '🪙 50', prize: '+50 Coins', color: '#0284C7', icon: 'monetization-on' },
  { label: '🪙 5', prize: '+5 Coins', color: '#7C3AED', icon: 'monetization-on' },
  { label: '🪙 100', prize: '+100 Coins', color: '#D97706', icon: 'monetization-on' },
  { label: '🎁 250', prize: '🎁 Jackpot (+250 Coins)', color: '#DC2626', icon: 'card-giftcard' },
  { label: '🪙 10', prize: '+10 Coins', color: '#2563EB', icon: 'monetization-on' },
  { label: '🪙 25', prize: '+25 Coins', color: '#059669', icon: 'monetization-on' },
];

const SIZE = 240;
const CX = SIZE / 2; // 120
const CY = SIZE / 2; // 120
const R = 104; // Outer radius of wedges

function getPiePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

interface SvgSpinWheelProps {
  spinInterpolate: Animated.AnimatedInterpolation<string | number>;
}

export const SvgSpinWheel: React.FC<SvgSpinWheelProps> = ({ spinInterpolate }) => {
  return (
    <View style={styles.container}>
      {/* Top Pointer Needle */}
      <View style={styles.pointerContainer}>
        <Svg width="36" height="32" viewBox="0 0 36 32">
          {/* Outer shadow triangle */}
          <Polygon points="18,32 4,2 32,2" fill="#78350F" />
          {/* Gold inner needle */}
          <Polygon points="18,28 7,5 29,5" fill="#FFC928" stroke="#FFFFFF" strokeWidth="1.5" />
        </Svg>
      </View>

      {/* Animated Rotating Wheel SVG */}
      <Animated.View style={[styles.wheelContainer, { transform: [{ rotate: spinInterpolate }] }]}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <G>
            {/* 6 Circular Pie Wedges */}
            {WHEEL_SEGMENTS.map((seg, i) => {
              const startDeg = i * 60 - 90;
              const endDeg = (i + 1) * 60 - 90;
              const midDeg = (startDeg + endDeg) / 2;
              const path = getPiePath(CX, CY, R, startDeg, endDeg);

              const textRad = (midDeg * Math.PI) / 180;
              const tx = CX + R * 0.62 * Math.cos(textRad);
              const ty = CY + R * 0.62 * Math.sin(textRad);

              return (
                <G key={i}>
                  <Path d={path} fill={seg.color} stroke="#FFD700" strokeWidth="2.5" />
                  <SvgText
                    x={tx}
                    y={ty}
                    fill="#FFFFFF"
                    fontSize="13"
                    fontWeight="900"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={`rotate(${midDeg + 90}, ${tx}, ${ty})`}
                  >
                    {seg.label}
                  </SvgText>
                </G>
              );
            })}

            {/* Gold Outer Frame Rim */}
            <Circle cx={CX} cy={CY} r={R} fill="none" stroke="#FFC928" strokeWidth="7" />
            <Circle cx={CX} cy={CY} r={R + 4.5} fill="none" stroke="#92400E" strokeWidth="2" />

            {/* 12 Outer Perimeter Glowing Light Bulbs */}
            {Array.from({ length: 12 }).map((_, k) => {
              const bulbDeg = (k * 30 * Math.PI) / 180;
              const bx = CX + (R + 0.5) * Math.cos(bulbDeg);
              const by = CY + (R + 0.5) * Math.sin(bulbDeg);
              const isGlowing = k % 2 === 0;

              return (
                <G key={k}>
                  <Circle
                    cx={bx}
                    cy={by}
                    r={isGlowing ? 4 : 3}
                    fill={isGlowing ? '#FFFBEB' : '#FFC928'}
                    stroke="#B45309"
                    strokeWidth="1"
                  />
                </G>
              );
            })}

            {/* Center Metallic Gold Hub */}
            <Circle cx={CX} cy={CY} r={25} fill="#FFC928" stroke="#FFFFFF" strokeWidth="3" />
            <Circle cx={CX} cy={CY} r={18} fill="#2E1065" stroke="#F59E0B" strokeWidth="1.5" />
          </G>
        </Svg>

        {/* Center Star Overlay Icon */}
        <View style={styles.centerIconOverlay}>
          <MaterialIcons name="stars" size={20} color="#FFC928" />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  pointerContainer: {
    position: 'absolute',
    top: -12,
    zIndex: 30,
    elevation: 8,
  },
  wheelContainer: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E1065',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  centerIconOverlay: {
    position: 'absolute',
    top: CY - 10,
    left: CX - 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
