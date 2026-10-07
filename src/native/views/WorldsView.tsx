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
import {
  OceanBubble,
  OceanCoral,
  OceanSeaweed,
  OceanShipwreck,
  OceanAtlantisPalace,
  OceanChest,
} from '../components/BubbleOceanVectors';

interface WorldsViewProps {
  onStartLevel: (levelId: number) => void;
  activeLevelId: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NativeWorldsView: React.FC<WorldsViewProps> = ({
  onStartLevel,
  activeLevelId = 4,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<'sunny' | 'ocean'>(
    activeLevelId > 100 ? 'ocean' : 'sunny'
  );
  const [selectedModalLevel, setSelectedModalLevel] = useState<number | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activeLevelId > 100) {
      setSelectedChapter('ocean');
    }
  }, [activeLevelId]);

  // ALL 100 Levels for Sunny Valley (Levels 1-100)
  const chapter1Levels = INITIAL_LEVELS.filter((l) => l.id <= 100);
  // ALL 100 Levels for Bubble Ocean (Levels 101-200)
  const chapter2Levels = INITIAL_LEVELS.filter((l) => l.id >= 101);
  
  const activeLevelsList = selectedChapter === 'ocean' ? chapter2Levels : chapter1Levels;

  const scrollToActiveLevel = () => {
    if (scrollRef.current) {
      const mapHeight = activeLevelsList.length * 110 + 200;
      const relativeIndex = selectedChapter === 'ocean'
        ? Math.max(0, Math.min(activeLevelsList.length - 1, activeLevelId - 101))
        : Math.max(0, Math.min(activeLevelsList.length - 1, activeLevelId - 1));
      const y = mapHeight - relativeIndex * 110 - 300;
      scrollRef.current.scrollTo({ y: Math.max(0, y), animated: true });
    }
  };

  useEffect(() => {
    setTimeout(scrollToActiveLevel, 300);
  }, [activeLevelId, selectedChapter]);

  const handleNodeClick = (lvl: number, isLocked: boolean) => {
    if (isLocked) {
      setAlertInfo({
        title: 'Level Locked',
        message: `Level ${lvl} is locked! Complete earlier levels first.`,
      });
      return;
    }
    nativeAudio.playLetterTap(2);
    setSelectedModalLevel(lvl);
  };

  const completedInSunny = Math.min(100, Math.max(0, activeLevelId - 1));
  const completedInOcean = Math.min(100, Math.max(0, activeLevelId - 100));
  const completedCount = selectedChapter === 'ocean' ? completedInOcean : completedInSunny;
  const totalInChapter = activeLevelsList.length || 100;
  const chapterProgressPercent = Math.min(100, Math.round((completedCount / totalInChapter) * 100));

  const mapHeight = activeLevelsList.length * 110 + 200;
  const roadPathD =
    `M 175 ${mapHeight}` +
    activeLevelsList
      .map(
        (_, idx) =>
          ` L ${150 + Math.sin(idx * 0.8) * 100 + 25} ${
            mapHeight - (idx * 110 + 100 + 25)
          }`
      )
      .join('');

  // Sunny Valley Landmark rendering along trail
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
          {lvlId === 100 && (
            <View style={[styles.landmarkItem, { bottom: bottom + 32, left: 236 }]}>
              <ValleySignpost label="VALLEY PEAK" />
            </View>
          )}
        </View>
      );
    }

    const cycle = lvlId % 7;
    if (cycle === 1) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <ValleyTree type="oak" scale={1.08} />
          <View style={styles.butterflyPin}>
            <ValleyButterfly color="#EC4899" />
          </View>
        </View>
      );
    } else if (cycle === 2) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX - 4 }]}>
          <ValleyWindmill size={68} />
        </View>
      );
    } else if (cycle === 3) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <ValleyFlowerPatch scale={1.2} />
        </View>
      );
    } else if (cycle === 4) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <ValleyTree type="pine" scale={1.1} />
        </View>
      );
    } else if (cycle === 6) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <ValleyFlowerPatch scale={1.3} />
          <View style={styles.butterflyPin}>
            <ValleyButterfly color="#F59E0B" />
          </View>
        </View>
      );
    }

    return (
      <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
        <ValleyTree type="oak" scale={1.05} />
      </View>
    );
  };

  // Bubble Ocean Landmark rendering along trail
  const renderOceanLandmark = (lvlId: number, index: number) => {
    const bottom = index * 110 + 85;
    const isRightSideCurve = Math.sin(index * 0.8) * 100 > 0;
    const meadowX = isRightSideCurve ? 22 : 246;

    if (lvlId === 101) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={styles.landmarkWrapper}>
          <View style={[styles.landmarkItem, { bottom: bottom - 8, left: 24 }]}>
            <OceanShipwreck size={58} />
          </View>
          <View style={[styles.landmarkItem, { bottom: bottom + 12, left: 232 }]}>
            <ValleySignpost label="ABYSS START" />
          </View>
        </View>
      );
    }

    if (lvlId % 5 === 0 || lvlId === 200) {
      const isClaimed = activeLevelId > lvlId;
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={styles.landmarkWrapper}>
          <View style={[styles.landmarkItem, { bottom: bottom + 2, left: meadowX }]}>
            <OceanChest level={lvlId} isClaimed={isClaimed} />
          </View>
          {lvlId === 200 && (
            <View style={[styles.landmarkItem, { bottom: bottom + 35, left: 236 }]}>
              <OceanAtlantisPalace size={70} />
            </View>
          )}
        </View>
      );
    }

    const cycle = lvlId % 6;
    if (cycle === 1) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <OceanCoral scale={1.1} color="#EC4899" />
        </View>
      );
    } else if (cycle === 2) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom: bottom - 10, left: meadowX - 4 }]}>
          <OceanBubble size={32} />
        </View>
      );
    } else if (cycle === 3) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <OceanSeaweed height={48} />
        </View>
      );
    } else if (cycle === 4) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <OceanCoral scale={1.2} color="#F59E0B" />
        </View>
      );
    } else if (cycle === 5) {
      return (
        <View key={`landmark-${lvlId}`} pointerEvents="none" style={[styles.landmarkItem, { bottom, left: meadowX }]}>
          <OceanBubble size={36} opacity={0.9} />
        </View>
      );
    }

    return null;
  };

  const isOcean = selectedChapter === 'ocean';

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onLayout={scrollToActiveLevel}
      >
        {/* Chapter Header Card */}
        <View style={[styles.chapterCard, isOcean && styles.chapterCardOcean]}>
          <View style={styles.chapterHeader}>
            <View style={styles.chapterTitleRow}>
              <MaterialIcons
                name={isOcean ? 'water-drop' : 'wb-sunny'}
                size={20}
                color={isOcean ? '#00F2FE' : '#F59E0B'}
              />
              <View>
                <Text style={[styles.chapterTitle, isOcean && styles.chapterTitleOcean]}>
                  {isOcean ? 'CHAPTER 2: BUBBLE OCEAN' : 'CHAPTER 1: SUNNY VALLEY'}
                </Text>
                <Text style={[styles.chapterSubtitle, isOcean && styles.chapterSubtitleOcean]}>
                  {isOcean
                    ? 'Deep sea treasures, glowing coral reefs & floating bubbles'
                    : 'Golden meadows, windmills & blooming flowers'}
                </Text>
              </View>
            </View>
            <View style={[styles.chapterStars, isOcean && styles.chapterStarsOcean]}>
              <MaterialIcons name="star" size={14} color={isOcean ? '#00F2FE' : '#F59E0B'} />
              <Text style={[styles.chapterStarsText, isOcean && styles.chapterStarsTextOcean]}>
                {completedCount}/{totalInChapter}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={isOcean ? ['#06B6D4', '#00F2FE', '#3B82F6'] : ['#F59E0B', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${chapterProgressPercent}%` }]}
            />
          </View>

          {/* Worlds Sub-pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.worldPillsRow}>
            <Pressable
              onPress={() => {
                nativeAudio.playLetterTap(1);
                setSelectedChapter('sunny');
              }}
              style={[
                styles.worldPill,
                selectedChapter === 'sunny' ? styles.worldPillActive : styles.worldPillInactive,
              ]}
            >
              <MaterialIcons
                name="wb-sunny"
                size={14}
                color={selectedChapter === 'sunny' ? '#FFFFFF' : '#8B7FB0'}
              />
              <Text
                style={
                  selectedChapter === 'sunny'
                    ? styles.worldPillTextActive
                    : styles.worldPillTextInactive
                }
              >
                Sunny Valley (1-100)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                nativeAudio.playLetterTap(1);
                setSelectedChapter('ocean');
              }}
              style={[
                styles.worldPill,
                selectedChapter === 'ocean' ? styles.worldPillActiveOcean : styles.worldPillInactive,
              ]}
            >
              <MaterialIcons
                name="water-drop"
                size={14}
                color={selectedChapter === 'ocean' ? '#FFFFFF' : '#06B6D4'}
              />
              <Text
                style={
                  selectedChapter === 'ocean'
                    ? styles.worldPillTextActive
                    : styles.worldPillTextInactive
                }
              >
                Bubble Ocean (101-200)
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setAlertInfo({
                  title: 'Coming Soon',
                  message: 'Candy Clouds unlocks at Chapter 3!',
                })
              }
              style={[styles.worldPill, styles.worldPillInactive]}
            >
              <MaterialIcons name="cloud" size={14} color="#8B7FB0" />
              <Text style={styles.worldPillTextInactive}>Candy</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Dynamic Winding Road Map Container */}
        <View style={[styles.mapCard, isOcean && styles.mapCardOcean, { height: mapHeight }]}>
          {/* Meadow / Ocean Background Gradient */}
          <LinearGradient
            colors={
              isOcean
                ? [
                    '#051329',
                    '#0A2240',
                    '#0F3460',
                    '#0284C7',
                    '#38BDF8',
                    '#00F2FE',
                    '#38BDF8',
                    '#0284C7',
                    '#0A2240',
                    '#051329',
                  ]
                : [
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
                  ]
            }
            locations={[0, 0.04, 0.08, 0.2, 0.4, 0.6, 0.75, 0.88, 0.95, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Sky / Underwater Vista at Top */}
          <View pointerEvents="none" style={styles.topSkyVista}>
            {isOcean ? (
              <>
                <View style={styles.topSunWrapper}>
                  <OceanAtlantisPalace size={80} />
                </View>
                <View style={styles.topCloudLeft}>
                  <OceanBubble size={30} opacity={0.9} />
                </View>
                <View style={styles.topCloudRight}>
                  <OceanBubble size={38} opacity={0.95} />
                </View>
                <View style={[styles.topBannerPill, styles.topBannerPillOcean]}>
                  <MaterialIcons name="water-drop" size={14} color="#00F2FE" />
                  <Text style={[styles.topBannerText, styles.topBannerTextOcean]}>
                    BUBBLE OCEAN SUMMIT
                  </Text>
                </View>
              </>
            ) : (
              <>
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
              </>
            )}
          </View>

          {/* SVG Winding Road Path */}
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 360 ${mapHeight}`} preserveAspectRatio="none">
            {/* Rolling contour curves */}
            {activeLevelsList.map((_, idx) => {
              if (idx % 4 !== 0) return null;
              const y = mapHeight - (idx * 110 + 100);
              const isAlt = (idx / 4) % 2 === 0;
              return (
                <Path
                  key={`hill-${idx}`}
                  d={
                    isAlt
                      ? `M -20 ${y} Q 90 ${y - 40} 200 ${y} T 380 ${y + 25}`
                      : `M -20 ${y + 20} Q 150 ${y - 45} 300 ${y + 10} T 380 ${y}`
                  }
                  fill="none"
                  stroke={isOcean ? 'rgba(0, 242, 254, 0.15)' : 'rgba(34, 197, 94, 0.16)'}
                  strokeWidth="20"
                />
              );
            })}

            {/* Outer Trail Border */}
            <Path
              d={roadPathD}
              fill="none"
              stroke={isOcean ? '#0284C7' : '#16A34A'}
              strokeWidth="62"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Earth/Sea Curb */}
            <Path
              d={roadPathD}
              fill="none"
              stroke={isOcean ? '#06B6D4' : '#F59E0B'}
              strokeWidth="50"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Cobblestone Sandy Roadbed */}
            <Path
              d={roadPathD}
              fill="none"
              stroke={isOcean ? '#E0F2FE' : '#FFFBEB'}
              strokeWidth="40"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Stepping stone texture */}
            <Path
              d={roadPathD}
              fill="none"
              stroke={isOcean ? '#38BDF8' : '#FDE68A'}
              strokeWidth="32"
              strokeDasharray="4, 12"
            />
            {/* Glowing Dashed Centerline */}
            <Path
              d={roadPathD}
              fill="none"
              stroke={isOcean ? '#00F2FE' : '#D97706'}
              strokeWidth="3"
              strokeDasharray="8, 8"
              strokeLinejoin="round"
            />
          </Svg>

          {/* Vector Landmarks along trail */}
          {activeLevelsList.map((lvl, index) =>
            isOcean
              ? renderOceanLandmark(lvl.id, index)
              : renderSunnyValleyLandmark(lvl.id, index)
          )}

          {/* Level Nodes Placed Along the Winding Road (Preserving existing button styles!) */}
          {activeLevelsList.map((lvl, index) => {
            const bottom = index * 110 + 100;
            const left = 150 + Math.sin(index * 0.8) * 100;
            const isLocked = lvl.id > activeLevelId;
            const isDone = lvl.id < activeLevelId;
            const isActive = lvl.id === activeLevelId;

            return (
              <View key={`node-${lvl.id}`} style={[styles.nodeAbsolute, { bottom, left }]}>
                {isActive && (
                  <View style={[styles.letsGoBubble, isOcean && styles.letsGoBubbleOcean]}>
                    <MaterialIcons
                      name={isOcean ? 'water-drop' : 'wb-sunny'}
                      size={11}
                      color={isOcean ? '#00F2FE' : '#FEF08A'}
                    />
                    <Text style={styles.letsGoText}>CURRENT</Text>
                  </View>
                )}

                <Pressable
                  onPress={() => handleNodeClick(lvl.id, isLocked)}
                  style={({ pressed }) => [
                    styles.nodeBtn,
                    isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodeLocked,
                    pressed && styles.pressed,
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

                <View
                  style={[
                    styles.nodeLabelBadge,
                    isActive && styles.nodeLabelBadgeActive,
                    isDone && styles.nodeLabelBadgeDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.nodeLabelText,
                      isActive && styles.nodeLabelTextActive,
                      isDone && styles.nodeLabelTextDone,
                      isLocked && styles.nodeLabelTextLocked,
                    ]}
                  >
                    Level {lvl.id}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Continue Button (Preserving existing button design!) */}
      <View style={styles.stickyFooter}>
        <Pressable
          onPress={() => {
            nativeAudio.playLetterTap(3);
            onStartLevel(activeLevelId);
          }}
          style={({ pressed }) => [
            styles.continueBtn,
            isOcean && styles.continueBtnOcean,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
          <Text style={styles.continueBtnText}>CONTINUE LEVEL {activeLevelId}</Text>
        </Pressable>
      </View>

      {/* Level Info Modal */}
      <Modal visible={selectedModalLevel !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeaderCircle, isOcean && { backgroundColor: '#0284C7' }]}>
              <MaterialIcons name="explore" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>LEVEL {selectedModalLevel}</Text>
            {(() => {
              const modalLevelData = INITIAL_LEVELS.find((l) => l.id === selectedModalLevel);
              return (
                <Text style={styles.modalSub}>
                  {selectedModalLevel && selectedModalLevel > 100
                    ? `Chapter 2 • Bubble Ocean ${modalLevelData?.maskIcon ? `(${modalLevelData.maskIcon} ${modalLevelData.maskName})` : ''}`
                    : 'Chapter 1 • Sunny Valley'}
                </Text>
              );
            })()}

            <View style={styles.modalWordsPreview}>
              <Text style={styles.modalWordsLabel}>OBJECTIVE</Text>
              <Text style={styles.modalWordsText}>
                Find all hidden words on the 8x8 matrix to earn 3 stars & 50 coins!
              </Text>
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
                style={[styles.modalPlayBtn, isOcean && { backgroundColor: '#0284C7' }]}
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
    paddingBottom: 260,
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
  chapterCardOcean: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
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
  chapterTitleOcean: {
    color: '#0369A1',
  },
  chapterSubtitle: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#B45309',
  },
  chapterSubtitleOcean: {
    color: '#0284C7',
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
  chapterStarsOcean: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  chapterStarsText: {
    color: '#B45309',
    fontWeight: '900',
    fontSize: 12,
  },
  chapterStarsTextOcean: {
    color: '#0369A1',
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
  worldPillActiveOcean: {
    backgroundColor: '#0284C7',
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
  mapCardOcean: {
    borderColor: '#38BDF8',
    shadowColor: '#0284C7',
    backgroundColor: '#051329',
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
  topBannerPillOcean: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
    shadowColor: '#00F2FE',
  },
  topBannerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  topBannerTextOcean: {
    color: '#E0F2FE',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  letsGoBubbleOcean: {
    backgroundColor: '#0284C7',
  },
  letsGoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  nodeLabelBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nodeLabelBadgeActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  nodeLabelBadgeDone: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  nodeLabelText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  nodeLabelTextActive: {
    color: '#B45309',
  },
  nodeLabelTextDone: {
    color: '#047857',
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
    zIndex: 90,
  },
  continueBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  continueBtnOcean: {
    backgroundColor: '#0284C7',
    borderColor: '#67E8F9',
    shadowColor: '#0284C7',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalHeaderCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
  },
  modalWordsPreview: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  modalWordsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  modalWordsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 12,
  },
  modalPlayBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  modalPlayText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
});
