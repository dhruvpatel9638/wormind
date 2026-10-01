import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  coins: number;
  hearts: number;
  maxHearts: number;
  heartCountdown: string;
  level: number;
  onOpenShop: () => void;
  onRefillHearts: () => void;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
}

export const NativeHeader: React.FC<HeaderProps> = ({
  coins,
  hearts,
  maxHearts,
  heartCountdown,
  level,
  onOpenShop,
  onRefillHearts,
  musicEnabled = true,
  onToggleMusic,
}) => {
  return (
    <LinearGradient
      colors={['#A8E6FF', '#D4B5FF']}
      style={styles.headerContainer}
    >
      <View style={styles.row}>
        {/* Hearts Life Badge */}
        <Pressable
          onPress={onRefillHearts}
          style={({ pressed }) => [styles.badge, styles.heartBadge, pressed && styles.pressed]}
        >
          <MaterialIcons name="favorite" size={17} color="#EF3B3B" />
          <Text style={styles.heartText}>{hearts}/{maxHearts}</Text>
          {hearts < maxHearts && (
            <Text style={styles.countdownText}>{heartCountdown}</Text>
          )}
        </Pressable>

        {/* Coins Money Badge */}
        <View style={[styles.badge, styles.coinBadge]}>
          <MaterialIcons name="monetization-on" size={17} color="#D4A200" />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
          <Pressable
            onPress={onOpenShop}
            style={({ pressed }) => [styles.plusBtn, pressed && styles.pressed]}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>

        {/* Level Badge */}
        <View style={[styles.badge, styles.levelBadge]}>
          <MaterialIcons name="military-tech" size={17} color="#286BEA" />
          <Text style={styles.levelText}>Lv. {level}</Text>
        </View>

        {/* Music Quick Toggle */}
        {onToggleMusic && (
          <Pressable
            onPress={onToggleMusic}
            style={({ pressed }) => [
              styles.musicBtn,
              musicEnabled ? styles.musicOn : styles.musicOff,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={musicEnabled ? 'music-note' : 'music-off'}
              size={18}
              color={musicEnabled ? '#FFFFFF' : '#9B8EC0'}
            />
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  heartBadge: {
    borderColor: '#FFB0C0',
    borderWidth: 1.5,
  },
  heartText: {
    color: '#EF3B3B',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },
  countdownText: {
    color: '#E06080',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },
  coinBadge: {
    borderColor: '#FFE066',
    borderWidth: 1.5,
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  coinText: {
    color: '#B8860B',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 2,
  },
  plusBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFC928',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#5A3800',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  levelBadge: {
    borderColor: '#B0D8FF',
    borderWidth: 1.5,
  },
  levelText: {
    color: '#286BEA',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },
  musicBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicOn: {
    backgroundColor: '#35C94A',
  },
  musicOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#D4B5FF',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
