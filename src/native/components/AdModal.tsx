import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ADMOB_CONFIG } from '../../config/admob';

const { width, height } = Dimensions.get('window');

interface AdModalProps {
  visible: boolean;
  type: 'interstitial' | 'rewarded';
  adUnitId: string;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  visible,
  type,
  adUnitId,
  onClose,
}) => {
  const [countdown, setCountdown] = useState<number>(type === 'rewarded' ? 5 : 3);
  const [canReward, setCanReward] = useState<boolean>(type === 'interstitial');
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setCountdown(type === 'rewarded' ? 5 : 3);
      setCanReward(type === 'interstitial');
      progressAnim.setValue(0);
      return;
    }

    const totalSeconds = type === 'rewarded' ? 5 : 3;
    setCountdown(totalSeconds);
    setCanReward(type === 'interstitial');

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: totalSeconds * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanReward(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, type, progressAnim]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>TEST AD</Text>
            </View>
            <Text style={styles.headerTitle}>
              {type === 'rewarded' ? 'Google Rewarded Test Video' : 'Google Interstitial Test Ad'}
            </Text>
          </View>

          {canReward ? (
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{countdown}s</Text>
            </View>
          )}
        </View>

        {/* Top Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Ad Video Content Player Area */}
        <View style={styles.adBody}>
          <View style={styles.adCard}>
            <View style={styles.adIconCircle}>
              <MaterialIcons
                name={type === 'rewarded' ? 'play-circle-filled' : 'view-carousel'}
                size={64}
                color="#0284C7"
              />
            </View>

            <Text style={styles.adTitle}>
              {type === 'rewarded' ? '🎬 WATCH AD FOR FREE HINT' : '✨ LEVEL COMPLETED!'}
            </Text>

            <Text style={styles.adSub}>
              {type === 'rewarded'
                ? 'Thank you for supporting Wormind!'
                : 'Nice job completing the puzzle!'}
            </Text>

            <View style={styles.idBox}>
              <Text style={styles.idLabel}>Ad Unit ID:</Text>
              <Text style={styles.idText}>{adUnitId}</Text>
            </View>

            {/* Reward Earned Badge */}
            {canReward && type === 'rewarded' && (
              <View style={styles.rewardGrantedBadge}>
                <MaterialIcons name="check-circle" size={22} color="#16A34A" />
                <Text style={styles.rewardGrantedText}>🎁 FREE HINT REWARD UNLOCKED!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Action Button */}
        <View style={styles.footer}>
          {canReward ? (
            <Pressable onPress={onClose} style={styles.actionBtnActive}>
              <Text style={styles.actionBtnText}>
                {type === 'rewarded' ? 'CLAIM FREE HINT & CLOSE' : 'CONTINUE TO GAME'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.actionBtnDisabled}>
              <Text style={styles.actionBtnTextDisabled}>
                Reward in {countdown}s...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  testBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 20,
  },
  timerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  adBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  adCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  adIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  adTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  adSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  idBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  idLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  idText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  rewardGrantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#052E16',
    borderColor: '#16A34A',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 20,
  },
  rewardGrantedText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  actionBtnActive: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  actionBtnDisabled: {
    backgroundColor: '#334155',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextDisabled: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
