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
    { id: 'daily', label: 'Rewards', icon: 'card-giftcard', color: '#F59E0B' },
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
                isActive && { backgroundColor: item.color },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={compact ? 18 : 20}
                color={isActive ? '#FFFFFF' : '#8B7FB0'}
              />
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.navLabel,
                  compact && styles.navLabelCompact,
                  isActive && styles.navLabelActive,
                ]}
              >
                {item.label}
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
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 390,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  pillContainerCompact: {
    paddingHorizontal: 4,
    gap: 2,
  },
  navBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    gap: 6,
    position: 'relative',
    paddingHorizontal: 4,
  },
  navLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#8B7FB0',
  },
  navLabelCompact: {
    fontSize: 11,
    gap: 3,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dotBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});

