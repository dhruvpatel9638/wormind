import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PlayerState } from '../../types';
import { nativeAudio } from '../audio';

interface ProfileViewProps {
  playerState: PlayerState;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHaptics: () => void;
  onResetProgress: () => void;
}

export const NativeProfileView: React.FC<ProfileViewProps> = ({
  playerState,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
  onResetProgress,
}) => {
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Audio & Preferences</Text>

            {/* Sound Effects */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="volume-up" size={22} color="#286BEA" />
                <Text style={styles.settingLabel}>Sound Effects</Text>
              </View>
              <Switch
                value={playerState.soundEnabled}
                onValueChange={onToggleSound}
                trackColor={{ false: '#4B5563', true: '#7C3AED' }}
                thumbColor="#C4B5FD"
              />
            </View>

            {/* Background Music */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="music-note" size={22} color="#7652D9" />
                <Text style={styles.settingLabel}>Background Music</Text>
              </View>
              <Switch
                value={playerState.musicEnabled}
                onValueChange={onToggleMusic}
                trackColor={{ false: '#4B5563', true: '#7C3AED' }}
                thumbColor="#C4B5FD"
              />
            </View>

            {/* Haptics */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="vibration" size={22} color="#FFC928" />
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
              </View>
              <Switch
                value={playerState.hapticsEnabled}
                onValueChange={onToggleHaptics}
                trackColor={{ false: '#4B5563', true: '#7C3AED' }}
                thumbColor="#C4B5FD"
              />
            </View>

            {/* Reset Progress */}
            <Pressable
              onPress={() => setShowResetModal(true)}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            >
              <Text style={styles.resetBtnText}>Reset Progress</Text>
            </Pressable>
          </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.resetPopup}>
            <MaterialIcons name="warning" size={42} color="#EF3B3B" />
            <Text style={styles.popupTitle}>RESET PROGRESS?</Text>
            <Text style={styles.popupSub}>This will erase all your game progress, stars, and daily streaks. Are you sure?</Text>
            
            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setShowResetModal(false)}
                style={({ pressed }) => [styles.modalCancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowResetModal(false);
                  onResetProgress();
                }}
                style={({ pressed }) => [styles.modalConfirmBtn, pressed && styles.pressed]}
              >
                <Text style={styles.modalConfirmText}>RESET</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  card: {
    backgroundColor: '#2E1065',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EEF1FF',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#7B8AB8',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.2)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    color: '#EEF1FF',
    fontSize: 14,
    fontWeight: '700',
  },
  resetBtn: {
    marginTop: 20,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(239, 59, 59, 0.15)',
    borderWidth: 1,
    borderColor: '#EF3B3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#EF3B3B',
    fontWeight: '800',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resetPopup: {
    width: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EF3B3B',
    elevation: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF3B3B',
    marginTop: 12,
    marginBottom: 6,
  },
  popupSub: {
    fontSize: 12,
    color: '#7B8AB8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#7C3AED',
    fontWeight: '900',
    fontSize: 13,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#EF3B3B',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
