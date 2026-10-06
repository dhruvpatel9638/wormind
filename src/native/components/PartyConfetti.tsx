import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vibrant festive colors matching our Violet + Gold theme and party celebration
const CONFETTI_COLORS = [
  '#FFC928', // Royal Gold
  '#FFD700', // Bright Gold
  '#F59E0B', // Amber
  '#A855F7', // Bright Violet
  '#8B5CF6', // Purple
  '#C084FC', // Lavender Pink
  '#06B6D4', // Electric Cyan
  '#38BDF8', // Sky Blue
  '#EC4899', // Hot Pink
  '#F43F5E', // Rose
  '#FF5722', // Coral Flame
  '#10B981', // Emerald Mint
  '#FFFFFF', // Shiny White
];

interface ParticleConfig {
  id: number;
  type: 'ribbon' | 'square' | 'circle' | 'star';
  color: string;
  width: number;
  height: number;
  startX: number;
  startY: number;
  targetX: number;
  peakY: number;
  endY: number;
  sway1: number;
  sway2: number;
  rotDeg: number;
  duration: number;
  delay: number;
}

const NUM_PARTICLES = 52;

// Generate diverse particles (ribbons/zario, squares, dots, stars)
const generateParticles = (): ParticleConfig[] => {
  const particles: ParticleConfig[] = [];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    // 40% ribbons (zario), 30% squares, 20% circles, 10% stars
    const randType = Math.random();
    const type: 'ribbon' | 'square' | 'circle' | 'star' =
      randType < 0.42 ? 'ribbon' : randType < 0.72 ? 'square' : randType < 0.9 ? 'circle' : 'star';

    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    // Origin: Left cannon (40%), Right cannon (40%), Center blast (20%)
    const originSeed = Math.random();
    let startX: number;
    let startY: number;
    let targetX: number;
    let peakY: number;

    if (originSeed < 0.4) {
      // Left party bomb cannon (shoots up & right towards center)
      startX = Math.random() * (SCREEN_WIDTH * 0.25) - 20;
      startY = SCREEN_HEIGHT * 0.82 + Math.random() * 50;
      targetX = SCREEN_WIDTH * 0.15 + Math.random() * (SCREEN_WIDTH * 0.8);
      peakY = 40 + Math.random() * (SCREEN_HEIGHT * 0.35);
    } else if (originSeed < 0.8) {
      // Right party bomb cannon (shoots up & left towards center)
      startX = SCREEN_WIDTH * 0.75 + Math.random() * (SCREEN_WIDTH * 0.25);
      startY = SCREEN_HEIGHT * 0.82 + Math.random() * 50;
      targetX = Math.random() * (SCREEN_WIDTH * 0.8);
      peakY = 40 + Math.random() * (SCREEN_HEIGHT * 0.35);
    } else {
      // Center celebration burst
      startX = SCREEN_WIDTH * 0.5 + (Math.random() - 0.5) * 80;
      startY = SCREEN_HEIGHT * 0.45;
      targetX = Math.random() * SCREEN_WIDTH;
      peakY = 20 + Math.random() * (SCREEN_HEIGHT * 0.25);
    }

    const endY = SCREEN_HEIGHT + 30 + Math.random() * 50;
    const swayDistance = 25 + Math.random() * 45;

    // Dimensions: ribbons are long metallic strips ("zario")
    let width = 7;
    let height = 7;
    if (type === 'ribbon') {
      width = 6 + Math.random() * 3;
      height = 22 + Math.random() * 16;
    } else if (type === 'square') {
      const s = 8 + Math.random() * 4;
      width = s;
      height = s;
    } else if (type === 'circle') {
      const s = 7 + Math.random() * 4;
      width = s;
      height = s;
    } else {
      width = 12;
      height = 12;
    }

    particles.push({
      id: i,
      type,
      color,
      width,
      height,
      startX,
      startY,
      targetX,
      peakY,
      endY,
      sway1: targetX + swayDistance * (Math.random() > 0.5 ? 1 : -1),
      sway2: targetX - swayDistance * (Math.random() > 0.5 ? 1 : -1),
      rotDeg: (720 + Math.random() * 1080) * (Math.random() > 0.5 ? 1 : -1),
      duration: 2600 + Math.random() * 1200,
      delay: Math.random() * 550,
    });
  }

  return particles;
};

interface PartyConfettiProps {
  active: boolean;
}

export const PartyConfetti: React.FC<PartyConfettiProps> = ({ active }) => {
  const particles = useRef<ParticleConfig[]>(generateParticles()).current;
  const animProgress = useRef(particles.map(() => new Animated.Value(0))).current;
  const popperScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      animProgress.forEach((anim) => anim.setValue(0));
      popperScale.setValue(0);
      return;
    }

    // Party Popper shockwave pop
    Animated.sequence([
      Animated.spring(popperScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(popperScale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Launch all confetti & ribbons with slight stagger
    const animations = particles.map((p, index) => {
      return Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(animProgress[index], {
          toValue: 1,
          duration: p.duration,
          easing: Easing.bezier(0.12, 0.8, 0.32, 1),
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(15, animations).start();

    // Repeating loop for continuous magical zari flutter while modal is open
    const repeatTimer = setTimeout(() => {
      if (active) {
        // Reset and trigger secondary gentle loop
        const loopAnims = particles.slice(0, 24).map((p, i) => {
          animProgress[i].setValue(0.2); // Start already near the top
          return Animated.timing(animProgress[i], {
            toValue: 1,
            duration: p.duration * 0.9,
            easing: Easing.linear,
            useNativeDriver: true,
          });
        });
        Animated.stagger(60, loopAnims).start();
      }
    }, 3200);

    return () => clearTimeout(repeatTimer);
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Corner Party Popper Cannons (partybom burst visuals) */}
      <Animated.View
        style={[
          styles.leftPopper,
          {
            transform: [
              { scale: popperScale },
              { rotate: '-25deg' },
            ],
          },
        ]}
      >
        <MaterialIcons name="celebration" size={38} color="#FFC928" />
      </Animated.View>

      <Animated.View
        style={[
          styles.rightPopper,
          {
            transform: [
              { scale: popperScale },
              { rotate: '25deg' },
            ],
          },
        ]}
      >
        <MaterialIcons name="celebration" size={38} color="#FFC928" />
      </Animated.View>

      {/* Confetti & Ribbon Particles ("Zario") */}
      {particles.map((p, index) => {
        const anim = animProgress[index];

        // Trajectory Y: shoots up to peakY, then drifts down to endY
        const translateY = anim.interpolate({
          inputRange: [0, 0.22, 1],
          outputRange: [p.startY, p.peakY, p.endY],
        });

        // Trajectory X: shoots across with multi-stop wavy sway
        const translateX = anim.interpolate({
          inputRange: [0, 0.22, 0.5, 0.75, 1],
          outputRange: [p.startX, p.targetX, p.sway1, p.sway2, p.targetX],
        });

        // Rotation: spins continuously
        const rotateZ = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotDeg}deg`],
        });

        // 3D paper twist (zari flutter): scaleX oscillating between 1 and -1
        const scaleX = anim.interpolate({
          inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
          outputRange: [1, -0.9, 0.9, -0.9, 0.8, -0.8, 0.7, -0.7],
        });

        // Opacity: fades in immediately at blast, fades out near bottom
        const opacity = anim.interpolate({
          inputRange: [0, 0.05, 0.82, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.width,
                height: p.height,
                backgroundColor: p.type === 'star' ? 'transparent' : p.color,
                borderRadius: p.type === 'circle' ? p.width / 2 : p.type === 'ribbon' ? 3 : 2,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotateZ },
                  { scaleX },
                ],
              },
            ]}
          >
            {p.type === 'star' && (
              <MaterialIcons name="star" size={p.width} color={p.color} />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    elevation: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  leftPopper: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    elevation: 30,
    shadowColor: '#FFC928',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  rightPopper: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    elevation: 30,
    shadowColor: '#FFC928',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
});
