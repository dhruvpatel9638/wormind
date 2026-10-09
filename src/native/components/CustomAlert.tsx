import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  btnText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon,
  btnText = 'GOT IT',
  onClose,
  onConfirm,
}) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const sunburstRotate = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0)).current;

  // Continuous rotating sunburst halo (same as VictoryModal)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sunburstRotate, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sunburstRotate]);

  // Card pop-in spring animation on open
  useEffect(() => {
    if (visible) {
      cardScale.setValue(0);
      starScale.setValue(0);

      Animated.sequence([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 5,
          tension: 48,
          useNativeDriver: true,
        }),
        Animated.spring(starScale, {
          toValue: 1,
          friction: 4,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      cardScale.setValue(0);
      starScale.setValue(0);
    }
  }, [visible]);

  const haloSpin = sunburstRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Resolve dynamic icon & colors based on title/message context if not explicitly provided
  const lowerTitle = (title || '').toLowerCase();
  const lowerMsg = (message || '').toLowerCase();

  let resolvedIcon: keyof typeof MaterialIcons.glyphMap = icon || 'info';
  let iconColor = '#FDE047';

  if (!icon) {
    if (lowerTitle.includes('strike') || lowerMsg.includes('strike')) {
      resolvedIcon = 'local-fire-department';
      iconColor = '#FF4500';
    } else if (lowerTitle.includes('coin') || lowerMsg.includes('coin')) {
      resolvedIcon = 'monetization-on';
      iconColor = '#FFD700';
    } else if (lowerTitle.includes('lock') || lowerMsg.includes('locked')) {
      resolvedIcon = 'lock';
      iconColor = '#C4B5FD';
    } else if (lowerTitle.includes('hint') || lowerMsg.includes('hint')) {
      resolvedIcon = 'lightbulb';
      iconColor = '#FDE047';
    } else if (lowerTitle.includes('heart') || lowerMsg.includes('heart')) {
      resolvedIcon = 'favorite';
      iconColor = '#EF4444';
    } else if (lowerTitle.includes('ocean')) {
      resolvedIcon = 'water-drop';
      iconColor = '#38BDF8';
    } else if (lowerTitle.includes('candy') || lowerTitle.includes('cloud')) {
      resolvedIcon = 'cloud';
      iconColor = '#EC4899';
    }
  } else {
    if (icon === 'local-fire-department') iconColor = '#FF4500';
    else if (icon === 'monetization-on') iconColor = '#FFD700';
    else if (icon === 'favorite') iconColor = '#EF4444';
    else if (icon === 'lock') iconColor = '#C4B5FD';
    else if (icon === 'lightbulb') iconColor = '#FDE047';
  }

  // Parse lines to detect bullet points cleanly
  const lines = (message || '').split('\n').filter((l) => l.trim().length > 0);

  const handlePress = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        {/* Central Royal Card */}
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
          
          {/* Top Winged Crest with Sunburst Halo */}
          <View style={styles.crestWrapper}>
            {/* Rotating Golden Sunburst Halo */}
            <Animated.View style={[styles.sunburstHalo, { transform: [{ rotate: haloSpin }] }]}>
              {[0, 30, 60, 90, 120, 150].map((deg) => (
                <View
                  key={deg}
                  style={[
                    styles.sunburstRay,
                    { transform: [{ rotate: `${deg}deg` }] },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Floating Stars above the emblem */}
            <View style={styles.floatingStarsRow}>
              <Animated.View style={{ transform: [{ scale: starScale }, { translateY: 4 }] }}>
                <MaterialIcons name="star" size={24} color="#FFD700" style={styles.starShadow} />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: starScale }, { translateY: -4 }] }}>
                <MaterialIcons name="star" size={32} color="#FFFBEB" style={styles.starShadow} />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: starScale }, { translateY: 4 }] }}>
                <MaterialIcons name="star" size={24} color="#FFD700" style={styles.starShadow} />
              </Animated.View>
            </View>

            {/* Winged Emblem: Left Wings + Center Trophy Shield + Right Wings */}
            <View style={styles.wingsEmblemRow}>
              {/* Left Wing */}
              <View style={styles.wingLeft}>
                <View style={[styles.wingFeather, styles.wingFeatherTopLeft]} />
                <View style={[styles.wingFeather, styles.wingFeatherMidLeft]} />
                <View style={[styles.wingFeather, styles.wingFeatherBotLeft]} />
              </View>

              {/* Center Royal Shield */}
              <View style={styles.centerShield}>
                <LinearGradient
                  colors={['#FFD700', '#F59E0B', '#D97706']}
                  style={styles.shieldGradientRing}
                >
                  <View style={styles.shieldInner}>
                    <MaterialIcons name={resolvedIcon} size={38} color={iconColor} />
                  </View>
                </LinearGradient>
              </View>

              {/* Right Wing */}
              <View style={styles.wingRight}>
                <View style={[styles.wingFeather, styles.wingFeatherTopRight]} />
                <View style={[styles.wingFeather, styles.wingFeatherMidRight]} />
                <View style={[styles.wingFeather, styles.wingFeatherBotRight]} />
              </View>
            </View>
          </View>

          {/* 3D Sculpted Ribbon Banner for Title */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9', '#4C1D95']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerInnerBorder}>
                <Text style={styles.bannerTitleText} numberOfLines={2}>
                  {title.toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
            <View style={styles.bannerShadowBottom} />
          </View>

          {/* Message Content Container */}
          <View style={styles.messageBox}>
            {lines.map((line, idx) => {
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
              if (isBullet) {
                const cleanText = line.replace(/^[•\-]\s*/, '');
                return (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot}>
                      <MaterialIcons name="fiber-manual-record" size={8} color="#F59E0B" />
                    </View>
                    <Text style={styles.bulletText}>{cleanText}</Text>
                  </View>
                );
              }

              return (
                <Text
                  key={idx}
                  style={[
                    styles.messageText,
                    idx > 0 && { marginTop: 6 },
                    line.includes('Current Strike:') && styles.highlightText,
                  ]}
                >
                  {line}
                </Text>
              );
            })}
          </View>

          {/* Sculpted Action Button */}
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [styles.btnWrapper, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>{btnText.toUpperCase()}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 3, 24, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: Math.min(SCREEN_WIDTH - 44, 330),
    backgroundColor: '#1E0B40', // Deep Royal Loki Violet
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#7C3AED',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 22,
    paddingHorizontal: 18,
    elevation: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    marginTop: 36,
  },

  /* Crest & Wings Header */
  crestWrapper: {
    position: 'absolute',
    top: -56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstRay: {
    position: 'absolute',
    width: 130,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.16)',
  },
  floatingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: -4,
    zIndex: 10,
  },
  starShadow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  wingsEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerShield: {
    zIndex: 6,
  },
  shieldGradientRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  shieldInner: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* Wing Feathers */
  wingLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: -10,
  },
  wingRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: -10,
  },
  wingFeather: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  wingFeatherTopLeft: {
    width: 34,
    height: 12,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 2,
    transform: [{ rotate: '18deg' }, { translateY: -2 }],
  },
  wingFeatherMidLeft: {
    width: 40,
    height: 12,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '6deg' }],
  },
  wingFeatherBotLeft: {
    width: 28,
    height: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '-8deg' }, { translateY: 2 }],
  },

  wingFeatherTopRight: {
    width: 34,
    height: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 2,
    transform: [{ rotate: '-18deg' }, { translateY: -2 }],
  },
  wingFeatherMidRight: {
    width: 40,
    height: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '-6deg' }],
  },
  wingFeatherBotRight: {
    width: 28,
    height: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '8deg' }, { translateY: 2 }],
  },

  /* 3D Ribbon Banner */
  bannerContainer: {
    width: '95%',
    marginTop: 14,
    position: 'relative',
    alignItems: 'center',
  },
  bannerGradient: {
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  bannerInnerBorder: {
    alignItems: 'center',
  },
  bannerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerShadowBottom: {
    position: 'absolute',
    bottom: -4,
    width: '94%',
    height: 6,
    backgroundColor: '#3B0764',
    borderRadius: 10,
    zIndex: -1,
  },

  /* Message Box */
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 224, 71, 0.28)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
  },
  messageText: {
    color: '#F5F3FF',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'center',
  },
  highlightText: {
    color: '#FEF08A',
    fontWeight: '900',
    fontSize: 14.5,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    gap: 8,
  },
  bulletDot: {
    marginTop: 5,
  },
  bulletText: {
    flex: 1,
    color: '#EDE9FE',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },

  /* Action Button */
  btnWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  actionBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.2,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
