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
import {
  ValleySun,
  ValleyTree,
  ValleyWindmill,
  ValleyFlowerPatch,
  ValleySignpost,
  MilestoneChest,
  ValleyCloud,
  ValleyButterfly,
} from '../components/SunnyValleyVectors';

interface WorldsViewProps {
  onStartLevel: (levelId: number) => void;
  activeLevelId: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NativeWorldsView: React.FC<WorldsViewProps> = ({
  onStartLevel,
  activeLevelId = 1,
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
  const mapHeight = INITIAL_LEVELS.length * 110 + 200;
  const roadPathD = `M 175 ${mapHeight}` + INITIAL_LEVELS.map((_, idx) => ` L ${150 + Math.sin(idx * 0.8) * 100 + 25} ${mapHeight - (idx * 110 + 100 + 25)}`).join('');

  // Sunny Valley Landmark rendering along the winding trail
  const renderSunnyValleyLandmark = (lvlId: number, index: number) => {
    const bottom = index * 110 + 85;
    const isRightSideCurve = Math.sin(index * 0.8) * 100 > 0;
    const meadowX = isRightSideCurve ? 22 : 246;

    if (lvlId === 1) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={styles.landmarkWrapper}>
          <View style={[styles.landmarkItem, { bottom: bottom - 8, left: 24 }]}>
            <ValleyFlowerPatch scale={1.25} />
          </View>
          <View style={[styles.landmarkItem, { bottom: bottom + 12, left: 232 }]}>
            <ValleySignpost label="START" />
          </View>
        </View>
      );
    }

    if (lvlId % 5 === 0) {
      const isClaimed = activeLevelId > lvlId;
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={styles.landmarkWrapper}>
          <View style={[styles.landmarkItem, { bottom: bottom + 2, left: meadowX }]}>
            <MilestoneChest level={lvlId} isClaimed={isClaimed} />
          </View>
          {lvlId === 5 && (
            <View style={[styles.landmarkItem, { bottom: bottom + 35, left: 22 }]}>
              <ValleyTree type="pine" scale={0.9} />
            </View>
          )}
          {lvlId === 25 && (
            <View style={[styles.landmarkItem, { bottom: bottom + 32, left: 236 }]}>
              <ValleySignpost label="VALLEY PEAK" />
            </View>
          )}
        </View>
      );
    }

    switch (lvlId) {
      case 2:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="oak" scale={1.08} />
            <View style={styles.butterflyPin}>
              <ValleyButterfly color="#EC4899" />
            </View>
          </View>
        );
      case 3:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX - 4 }]}>
            <ValleyWindmill size={68} />
          </View>
        );
      case 4:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyFlowerPatch scale={1.2} />
          </View>
        );
      case 6:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="oak" scale={1.12} />
          </View>
        );
      case 7:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyFlowerPatch scale={1.3} />
            <View style={styles.butterflyPin}>
              <ValleyButterfly color="#F59E0B" />
            </View>
          </View>
        );
      case 8:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleySignpost label="ORCHARD" />
          </View>
        );
      case 9:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="pine" scale={1.1} />
          </View>
        );
      case 11:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX - 4 }]}>
            <ValleyWindmill size={66} />
          </View>
        );
      case 12:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="oak" scale={1.1} />
          </View>
        );
      case 13:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyFlowerPatch scale={1.2} />
            <View style={styles.butterflyPin}>
              <ValleyButterfly color="#8B5CF6" />
            </View>
          </View>
        );
      case 14:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="pine" scale={1.15} />
          </View>
        );
      case 16:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX }]}>
            <ValleyWindmill size={68} />
          </View>
        );
      case 17:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyFlowerPatch scale={1.25} />
          </View>
        );
      case 18:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="oak" scale={1.1} />
          </View>
        );
      case 19:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleySignpost label="SUNNY MEADOW" />
          </View>
        );
      case 21:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyFlowerPatch scale={1.2} />
            <View style={styles.butterflyPin}>
              <ValleyButterfly color="#06B6D4" />
            </View>
          </View>
        );
      case 22:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX }]}>
            <ValleyWindmill size={66} />
          </View>
        );
      case 23:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="pine" scale={1.1} />
          </View>
        );
      case 24:
        return (
          <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
            <ValleyTree type="oak" scale={1.2} />
          </View>
        );
      default: {
        const cycle = lvlId % 7;
        if (cycle === 1) {
          return (
            <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
              <ValleyTree type="oak" scale={1.05} />
            </View>
          );
        } else if (cycle === 2) {
          return (
            <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 8, left: meadowX }]}>
              <ValleyWindmill size={64} />
            </View>
          );
        } else if (cycle === 3) {
          return (
            <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
              <ValleyFlowerPatch scale={1.15} />
            </View>
          );
        } else if (cycle === 4) {
          return (
            <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
              <ValleyTree type="pine" scale={1.05} />
            </View>
          );
        } else if (cycle === 6) {
          return (
            <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
              <ValleyFlowerPatch scale={1.1} />
              <View style={styles.butterflyPin}>
                <ValleyButterfly color="#F43F5E" />
              </View>
            </View>
          );
        }
        return null;
      }
    }
  };

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
              <MaterialIcons name="wb-sunny" size={20} color="#F59E0B" />
              <View>
                <Text style={styles.chapterTitle}>CHAPTER 1: SUNNY VALLEY</Text>
                <Text style={styles.chapterSubtitle}>Golden meadows, windmills & blooming flowers</Text>
              </View>
            </View>
            <View style={styles.chapterStars}>
              <MaterialIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.chapterStarsText}>{completedInChapter}/25</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#F59E0B', '#10B981']}
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
        <View style={[styles.mapCard, { height: mapHeight }]}>
          {/* Lush Meadow Gradient Background */}
          <LinearGradient
            colors={[
              '#BAE6FD',
              '#E0F2FE',
              '#FEF9C3',
              '#DCFCE7',
              '#BBF7D0',
              '#86EFAC',
              '#BBF7D0',
              '#DCFCE7',
              '#FEF3C7',
              '#D1FAE5',
            ]}
            locations={[0, 0.04, 0.08, 0.2, 0.4, 0.6, 0.75, 0.88, 0.95, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Sunny Valley Sky Vista at Top */}
          <View pointerEvents="none" style={styles.topSkyVista}>
            <View style={styles.topSunWrapper}>
              <ValleySun size={86} />
            </View>
            <View style={styles.topCloudLeft}>
              <ValleyCloud scale={1.1} opacity={0.9} />
            </View>
            <View style={styles.topCloudRight}>
              <ValleyCloud scale={1.25} opacity={0.95} />
            </View>
            <View style={styles.topBannerPill}>
              <MaterialIcons name="wb-sunny" size={14} color="#D97706" />
              <Text style={styles.topBannerText}>SUNNY VALLEY SUMMIT</Text>
            </View>
          </View>

          {/* SVG Winding Road Path with Sunny Valley Cobblestone Styling */}
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 360 ${mapHeight}`} preserveAspectRatio="none">
            {/* Rolling meadow contour curves */}
            {INITIAL_LEVELS.map((_, idx) => {
              if (idx % 4 !== 0) return null;
              const y = mapHeight - (idx * 110 + 100);
              const isAlt = (idx / 4) % 2 === 0;
              return (
                <Path
                  key={`hill-${idx}`}
                  d={isAlt 
                    ? `M -20 ${y} Q 90 ${y - 40} 200 ${y} T 380 ${y + 25}`
                    : `M -20 ${y + 20} Q 150 ${y - 45} 300 ${y + 10} T 380 ${y}`
                  }
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.16)"
                  strokeWidth="20"
                />
              );
            })}

            {/* Outer Lush Grass Border */}
            <Path
              d={roadPathD}
              fill="none"
              stroke="#16A34A"
              strokeWidth="62"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Warm Golden Earth Curb */}
            <Path
              d={roadPathD}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="50"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Cobblestone Sandy Roadbed */}
            <Path
              d={roadPathD}
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="40"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Stepping stone cobblestone texture */}
            <Path
              d={roadPathD}
              fill="none"
              stroke="#FDE68A"
              strokeWidth="32"
              strokeLinejoin="round"
              strokeDasharray="4, 12"
            />
            {/* Golden Amber Dashed Centerline */}
            <Path
              d={roadPathD}
              fill="none"
              stroke="#D97706"
              strokeWidth="3"
              strokeDasharray="8, 8"
              strokeLinejoin="round"
            />
          </Svg>

          {/* Vector Landmarks along the trail */}
          {INITIAL_LEVELS.map((lvl, index) => renderSunnyValleyLandmark(lvl.id, index))}

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
                    <MaterialIcons name="wb-sunny" size={11} color="#FEF08A" />
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
                  {isLocked && <MaterialIcons name="lock" size={22} color="#94A3B8" />}
                </Pressable>

                {isDone && (
                  <View style={styles.starsRow}>
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                    <MaterialIcons name="star" size={13} color="#FFC928" />
                  </View>
                )}
                
                <View style={[
                  styles.nodeLabelBadge,
                  isActive && styles.nodeLabelBadgeActive,
                  isDone && styles.nodeLabelBadgeDone,
                ]}>
                  <Text style={[
                    styles.nodeLabelText,
                    isActive && styles.nodeLabelTextActive,
                    isDone && styles.nodeLabelTextDone,
                    isLocked && styles.nodeLabelTextLocked,
                  ]}>
                    Level {lvl.id}
                  </Text>
                </View>
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
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FDE68A',
    padding: 13,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#D97706',
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
    gap: 8,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.4,
  },
  chapterSubtitle: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#B45309',
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
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
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
    backgroundColor: '#D97706',
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
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#86EFAC',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  topSkyVista: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  topSunWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCloudLeft: {
    position: 'absolute',
    top: 24,
    left: 20,
  },
  topCloudRight: {
    position: 'absolute',
    top: 28,
    right: 18,
  },
  topBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 6,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topBannerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  landmarkWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  landmarkItem: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  butterflyPin: {
    position: 'absolute',
    top: -8,
    right: -10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nodeDone: {
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  nodeActive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  nodeLocked: {
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#CBD5E1',
  },
  activeNumber: {
    color: '#451A03',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  activePlayText: {
    color: '#451A03',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  letsGoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  nodeLabelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeLabelBadgeActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#6D28D9',
  },
  nodeLabelBadgeDone: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  nodeLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  nodeLabelTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  nodeLabelTextDone: {
    color: '#047857',
    fontWeight: '800',
  },
  nodeLabelTextLocked: {
    color: '#94A3B8',
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

