import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasClaimableDaily?: boolean;
}

export const NativeBottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  hasClaimableDaily = false,
}) => {
  const navItems: { id: Screen; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
    { id: 'worlds', label: 'Map', icon: 'map', color: '#35C94A' },
    { id: 'daily', label: 'Daily Reward', icon: 'card-giftcard', color: '#EF3B3B' },
    { id: 'profile', label: 'Profile', icon: 'person', color: '#7652D9' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
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
                size={22}
                color={isActive ? '#FFFFFF' : '#9B8EC0'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
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
    bottom: 58,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(212, 181, 255, 0.6)',
    elevation: 8,
    shadowColor: '#7652D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingHorizontal: 8,
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
  navLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9B8EC0',
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
    backgroundColor: '#EF3B3B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
