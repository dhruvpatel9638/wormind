import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasClaimableDaily?: boolean;
  bottomOffset?: number;
}

export const NativeBottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  hasClaimableDaily = false,
  bottomOffset = 58,
}) => {
  const { width } = useWindowDimensions();
  const compact = width <= 360;

  const navItems: { id: Screen; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
    { id: 'worlds', label: 'Map', icon: 'map', color: '#7C3AED' },
    { id: 'daily', label: 'Daily Reward', icon: 'card-giftcard', color: '#F59E0B' },
    { id: 'profile', label: 'Profile', icon: 'person', color: '#0D9488' },
  ];

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <View style={[styles.pillContainer, compact && styles.pillContainerCompact]}>
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onNavigate(item.id)}
              style={({ pressed }) => [
                styles.navBtn,
                compact && styles.navBtnCompact,
                isActive && { backgroundColor: item.color },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={compact ? 20 : 22}
                color={isActive ? '#FFFFFF' : '#8B7FB0'}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.navLabel,
                  compact && styles.navLabelCompact,
                  isActive && styles.navLabelActive,
                ]}
              >
                {compact && item.id === 'daily' ? 'Daily' : item.label}
              </Text>

              {item.id === 'daily' && hasClaimableDaily && (
                <View style={styles.dotBadge} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    paddingHorizontal: 8,
  },
  pillContainerCompact: {
    paddingHorizontal: 5,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    position: 'relative',
  },
  navBtnCompact: {
    paddingHorizontal: 9,
    gap: 4,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B7FB0',
  },
  navLabelCompact: {
    fontSize: 11,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotBadge: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
