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
      colors={['#8B5CF6', '#7C3AED']}
      style={styles.headerContainer}
    >
      <View style={styles.row}>
        {/* Hearts Life Badge */}
        <Pressable
          onPress={onRefillHearts}
          style={({ pressed }) => [styles.badge, styles.heartBadge, pressed && styles.pressed]}
        >
          <MaterialIcons name="favorite" size={17} color="#EF4444" />
          <Text style={styles.heartText}>{hearts}/{maxHearts}</Text>
          {hearts < maxHearts && (
            <Text style={styles.countdownText}>{heartCountdown}</Text>
          )}
        </Pressable>

        {/* Coins Money Badge (Gold Rewards) */}
        <View style={[styles.badge, styles.coinBadge]}>
          <MaterialIcons name="monetization-on" size={17} color="#F59E0B" />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
          <Pressable
            onPress={onOpenShop}
            style={({ pressed }) => [styles.plusBtn, pressed && styles.pressed]}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>

        {/* Level Badge (Teal Secondary) */}
        <View style={[styles.badge, styles.levelBadge]}>
          <MaterialIcons name="military-tech" size={17} color="#0D9488" />
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
              color={musicEnabled ? '#FFFFFF' : '#8B7FB0'}
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
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  heartBadge: {
    borderColor: '#FECACA',
    borderWidth: 1.5,
  },
  heartText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },
  countdownText: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },
  coinBadge: {
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  coinText: {
    color: '#B45309',
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
    borderColor: '#99F6E4',
    borderWidth: 1.5,
  },
  levelText: {
    color: '#0F766E',
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
    backgroundColor: '#0D9488',
  },
  musicOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
