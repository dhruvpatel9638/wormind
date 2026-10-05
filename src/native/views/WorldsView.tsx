import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { nativeAudio } from '../audio';
import { INITIAL_LEVELS } from '../../data/gameData';
import { CustomAlert } from '../components/CustomAlert';
interface WorldsViewProps {
  onStartLevel: (levelId: number) => void;
  activeLevelId: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NativeWorldsView: React.FC<WorldsViewProps> = ({
  onStartLevel,
  activeLevelId = 4,
}) => {
  const [selectedModalLevel, setSelectedModalLevel] = useState<number | null>(null);
  const [alertInfo, setAlertInfo] = useState<{title: string, message: string} | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToActiveLevel = () => {
    if (scrollRef.current) {
      const mapHeight = INITIAL_LEVELS.length * 110 + 200;
      const y = mapHeight - (activeLevelId * 110) - 300; 
      scrollRef.current.scrollTo({ y: Math.max(0, y), animated: true });
    }
  };

  useEffect(() => {
    setTimeout(scrollToActiveLevel, 300);
  }, [activeLevelId]);

  const handleNodeClick = (lvl: number, isLocked: boolean) => {
    if (isLocked) {
      setAlertInfo({ title: 'Level Locked', message: `Level ${lvl} is locked! Complete earlier levels first.` });
      return;
    }
    nativeAudio.playLetterTap(2);
    setSelectedModalLevel(lvl);
  };

  const completedInChapter = Math.min(25, Math.max(0, activeLevelId - 1));
  const chapterProgressPercent = Math.min(100, Math.round((completedInChapter / 25) * 100));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onLayout={scrollToActiveLevel}
      >
        {/* Chapter 1 Card */}
        <View style={styles.chapterCard}>
          <View style={styles.chapterHeader}>
            <View style={styles.chapterTitleRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.chapterTitle}>CHAPTER 1: SUNNY VALLEY</Text>
            </View>
            <View style={styles.chapterStars}>
              <MaterialIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.chapterStarsText}>{completedInChapter}/25</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#FFC928', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${chapterProgressPercent}%` }]}
            />
          </View>

          {/* Worlds Sub-pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.worldPillsRow}>
            <View style={[styles.worldPill, styles.worldPillActive]}>
              <MaterialIcons name="wb-sunny" size={14} color="#FFFFFF" />
              <Text style={styles.worldPillTextActive}>Sunny Valley</Text>
            </View>
            <Pressable
              onPress={() => setAlertInfo({ title: 'Coming Soon', message: 'Bubble Ocean unlocks at Chapter 2!' })}
              style={[styles.worldPill, styles.worldPillInactive]}
            >
              <MaterialIcons name="water-drop" size={14} color="#8B7FB0" />
              <Text style={styles.worldPillTextInactive}>Ocean</Text>
            </Pressable>
            <Pressable
              onPress={() => setAlertInfo({ title: 'Coming Soon', message: 'Candy Clouds unlocks at Chapter 3!' })}
              style={[styles.worldPill, styles.worldPillInactive]}
            >
              <MaterialIcons name="cloud" size={14} color="#8B7FB0" />
              <Text style={styles.worldPillTextInactive}>Candy</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Dynamic Winding Road Map Container */}
        <View style={[styles.mapCard, { height: INITIAL_LEVELS.length * 110 + 200 }]}>
          {/* Decorative Floating Bubbles - repeated for long map */}
          {INITIAL_LEVELS.map((_, i) => {
            if (i % 5 !== 0) return null;
            return (
              <View key={`bubble-${i}`} style={[styles.bubble, { 
                bottom: i * 110 + 20, 
                left: i % 2 === 0 ? 16 : undefined,
                right: i % 2 !== 0 ? 16 : undefined,
                backgroundColor: i % 2 === 0 ? 'rgba(255, 182, 193, 0.4)' : 'rgba(76, 175, 80, 0.4)'
              }]} />
            );
          })}

          {/* SVG Winding Road Path */}
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 360 ${INITIAL_LEVELS.length * 110 + 200}`} preserveAspectRatio="none">
            {/* Lavender background wide road */}
            <Path
              d={`M 175 ${INITIAL_LEVELS.length * 110 + 200}` + INITIAL_LEVELS.map((_, idx) => ` L ${150 + Math.sin(idx * 0.8) * 100 + 25} ${(INITIAL_LEVELS.length * 110 + 200) - (idx * 110 + 100 + 25)}`).join('')}
              fill="none"
              stroke="rgba(212, 181, 255, 0.55)"
              strokeWidth="56"
              strokeLinejoin="round"
            />
            {/* White road track */}
            <Path
              d={`M 175 ${INITIAL_LEVELS.length * 110 + 200}` + INITIAL_LEVELS.map((_, idx) => ` L ${150 + Math.sin(idx * 0.8) * 100 + 25} ${(INITIAL_LEVELS.length * 110 + 200) - (idx * 110 + 100 + 25)}`).join('')}
              fill="none"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="42"
              strokeLinejoin="round"
            />
            {/* Dashed purple center line */}
            <Path
              d={`M 175 ${INITIAL_LEVELS.length * 110 + 200}` + INITIAL_LEVELS.map((_, idx) => ` L ${150 + Math.sin(idx * 0.8) * 100 + 25} ${(INITIAL_LEVELS.length * 110 + 200) - (idx * 110 + 100 + 25)}`).join('')}
              fill="none"
              stroke="rgba(124, 58, 237, 0.35)"
              strokeWidth="3"
              strokeDasharray="8, 8"
              strokeLinejoin="round"
            />
          </Svg>

          {/* Level Nodes Placed Along the Winding Road */}
          {INITIAL_LEVELS.map((lvl, index) => {
            const bottom = index * 110 + 100;
            const left = 150 + Math.sin(index * 0.8) * 100;
            const isLocked = lvl.id > activeLevelId;
            const isDone = lvl.id < activeLevelId;
            const isActive = lvl.id === activeLevelId;

            return (
              <View key={`node-${lvl.id}`} style={[styles.nodeAbsolute, { bottom, left }]}>
                {isActive && (
                  <View style={styles.letsGoBubble}>
                    <Text style={styles.letsGoText}>CURRENT</Text>
                  </View>
                )}
                
                <Pressable
                  onPress={() => handleNodeClick(lvl.id, isLocked)}
                  style={({ pressed }) => [
                    styles.nodeBtn,
                    isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodeLocked,
                    pressed && styles.pressed
                  ]}
                >
                  {isDone && <MaterialIcons name="check" size={24} color="#FFFFFF" />}
                  {isActive && (
                    <>
                      <Text style={styles.activeNumber}>{lvl.id}</Text>
                      <Text style={styles.activePlayText}>PLAY</Text>
                    </>
                  )}
                  {isLocked && <MaterialIcons name="lock" size={22} color="#8B7FB0" />}
                </Pressable>

                {isDone && (
                  <View style={styles.starsRow}>
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                  </View>
                )}
                
                <Text style={[styles.nodeLabel, isActive && { color: '#7C3AED', fontWeight: '900', fontSize: 13 }, isLocked && { color: '#8B7FB0' }]}>
                  {lvl.id}: {lvl.title.split(' ')[0]}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={styles.stickyFooter}>
        <Pressable
          onPress={() => {
            nativeAudio.playLetterTap(3);
            onStartLevel(activeLevelId);
          }}
          style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
          <Text style={styles.continueBtnText}>CONTINUE LEVEL {activeLevelId}</Text>
        </Pressable>
      </View>

      {/* Level Info Modal */}
      <Modal visible={selectedModalLevel !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderCircle}>
              <MaterialIcons name="explore" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>LEVEL {selectedModalLevel}</Text>
            <Text style={styles.modalSub}>Chapter 1 • Sunny Valley</Text>

            <View style={styles.modalWordsPreview}>
              <Text style={styles.modalWordsLabel}>OBJECTIVE</Text>
              <Text style={styles.modalWordsText}>Find all hidden words on the 8x8 matrix to earn 3 stars & 50 coins!</Text>
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setSelectedModalLevel(null)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const target = selectedModalLevel || activeLevelId;
                  setSelectedModalLevel(null);
                  onStartLevel(target);
                }}
                style={styles.modalPlayBtn}
              >
                <MaterialIcons name="favorite" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.modalPlayText}>Play (1 Heart)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert 
        visible={!!alertInfo}
        title={alertInfo?.title || ''}
        message={alertInfo?.message || ''}
        onClose={() => setAlertInfo(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 200,
    alignItems: 'center',
  },
  chapterCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#DDD6FE',
    padding: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D9488',
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  chapterStars: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  chapterStarsText: {
    color: '#B45309',
    fontWeight: '900',
    fontSize: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  worldPillsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  worldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    gap: 4,
  },
  worldPillActive: {
    backgroundColor: '#7C3AED',
  },
  worldPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  worldPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  worldPillTextInactive: {
    color: '#8B7FB0',
    fontWeight: '700',
    fontSize: 11,
  },
  mapCard: {
    width: '100%',
    height: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(221, 214, 254, 0.8)',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  letterTree: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  treeCanopy: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    borderWidth: 3,
    borderColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  treeLetter: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  treeTrunk: {
    width: 10,
    height: 18,
    backgroundColor: '#B45309',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  valleyGate: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: [{ translateX: -80 }],
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    zIndex: 20,
    elevation: 5,
  },
  valleyGateTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  valleyGateSub: {
    color: '#DDD6FE',
    fontSize: 8,
    fontWeight: '600',
  },
  nodeAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  nodeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  nodeDone: {
    backgroundColor: '#0D9488',
    borderWidth: 3,
    borderColor: '#5EEAD4',
  },
  nodeActive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFC928',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  nodeLocked: {
    backgroundColor: '#EDE9FE',
    borderWidth: 3,
    borderColor: '#DDD6FE',
  },
  activeNumber: {
    color: '#5A3800',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  activePlayText: {
    color: '#5A3800',
    fontSize: 9,
    fontWeight: '900',
  },
  letsGoBubble: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  letsGoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E1065',
    marginTop: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 126,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    maxWidth: 380,
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#A78BFA',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    padding: 20,
    elevation: 10,
  },
  modalHeaderCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E1065',
    marginTop: 10,
  },
  modalSub: {
    fontSize: 12,
    color: '#8B7FB0',
    fontWeight: '600',
    marginBottom: 12,
  },
  modalWordsPreview: {
    width: '100%',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  modalWordsLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#7C3AED',
    marginBottom: 2,
  },
  modalWordsText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 13,
  },
  modalPlayBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlayText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});

