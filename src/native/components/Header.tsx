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
  strike?: number;
  onPressStrike?: () => void;
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
  strike = 10,
  onPressStrike,
  onOpenShop,
  onRefillHearts,
}) => {
  const formatCoins = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 100_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <LinearGradient
      colors={['#8B5CF6', '#7C3AED']}
      style={styles.headerContainer}
    >
      <View style={styles.row}>
        {/* 1. Snapchat Fire Strike Badge */}
        <Pressable
          onPress={onPressStrike}
          style={({ pressed }) => [
            styles.badge,
            styles.strikeBadge,
            strike <= 0 && styles.strikeBadgeZero,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name="local-fire-department"
            size={18}
            color={strike > 0 ? '#FF4500' : '#9CA3AF'}
          />
          <Text
            numberOfLines={1}
            style={[styles.badgeText, styles.strikeText, strike <= 0 && styles.strikeTextZero]}
          >
            {strike}
          </Text>
        </Pressable>

        {/* 2. Hearts Life Badge */}
        <Pressable
          onPress={onRefillHearts}
          style={({ pressed }) => [styles.badge, styles.heartBadge, pressed && styles.pressed]}
        >
          <MaterialIcons name="favorite" size={16} color="#EF4444" />
          <Text numberOfLines={1} style={[styles.badgeText, styles.heartText]}>
            {hearts}/{maxHearts}
          </Text>
          {hearts < maxHearts && (
            <Text numberOfLines={1} style={styles.countdownText}>
              {heartCountdown}
            </Text>
          )}
        </Pressable>

        {/* 3. Coins Money Badge (Gold Rewards) */}
        <View style={[styles.badge, styles.coinBadge]}>
          <MaterialIcons name="monetization-on" size={17} color="#F59E0B" />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[styles.badgeText, styles.coinText]}
          >
            {formatCoins(coins)}
          </Text>
          <Pressable
            onPress={onOpenShop}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={({ pressed }) => [styles.plusBtn, pressed && styles.pressed]}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>

        {/* 4. Level Badge (Teal Secondary) */}
        <View style={[styles.badge, styles.levelBadge]}>
          <MaterialIcons name="military-tech" size={18} color="#0D9488" />
          <Text numberOfLines={1} style={[styles.badgeText, styles.levelText]}>
            Lv. {level}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  badge: {
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 12,
  },
  strikeBadge: {
    flex: 1,
    borderColor: '#FED7AA',
    borderWidth: 1.5,
    backgroundColor: '#FFF7ED',
    gap: 3,
  },
  strikeBadgeZero: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  strikeText: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 13,
  },
  strikeTextZero: {
    color: '#9CA3AF',
  },
  heartBadge: {
    flex: 1.15,
    borderColor: '#FECACA',
    borderWidth: 1.5,
    gap: 3,
  },
  heartText: {
    color: '#EF4444',
  },
  countdownText: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  coinBadge: {
    flex: 1.55,
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  coinText: {
    color: '#B45309',
    fontWeight: '900',
    fontSize: 12,
    flexShrink: 1,
    marginHorizontal: 2,
  },
  plusBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 17,
  },
  levelBadge: {
    flex: 1,
    borderColor: '#99F6E4',
    borderWidth: 1.5,
    gap: 3,
  },
  levelText: {
    color: '#0F766E',
    fontWeight: '900',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
