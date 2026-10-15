const fs = require('fs');
const path = 'E:/wormind/src/native/views/GameView.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Animated,')) {
    content = content.replace('Alert,', 'Alert,\n  Animated,\n  Easing,');
}

const animHookStr = `  const [isVictory, setIsVictory] = useState<boolean>(false);
  const victoryScale = useRef(new Animated.Value(0)).current;
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVictory) {
      Animated.sequence([
        Animated.spring(victoryScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.spring(star1Scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.spring(star2Scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.spring(star3Scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    } else {
      victoryScale.setValue(0);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
    }
  }, [isVictory]);`;

content = content.replace('  const [isVictory, setIsVictory] = useState<boolean>(false);', animHookStr);

const originalModal = `<View style={styles.victoryCard}>
            <View style={styles.trophyCircle}>
              <MaterialIcons name="emoji-events" size={40} color="#172858" />
            </View>
            <Text style={styles.victoryTitle}>LEVEL COMPLETE!</Text>
            <Text style={styles.victorySubtitle}>You solved all words in Level {levelId}!</Text>

            <View style={styles.starsRow}>
              <MaterialIcons name="star" size={36} color="#FFC928" />
              <MaterialIcons name="star" size={42} color="#FFC928" />
              <MaterialIcons name="star" size={36} color="#FFC928" />
            </View>`;

const animatedModal = `<Animated.View style={[styles.victoryCard, { transform: [{ scale: victoryScale }] }]}>
            <View style={styles.trophyCircle}>
              <MaterialIcons name="emoji-events" size={40} color="#172858" />
            </View>
            <Text style={styles.victoryTitle}>LEVEL COMPLETE!</Text>
            <Text style={styles.victorySubtitle}>You solved all words in Level {levelId}!</Text>

            <View style={styles.starsRow}>
              <Animated.View style={{ transform: [{ scale: star1Scale }] }}>
                <MaterialIcons name="star" size={36} color="#FFC928" />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: star2Scale }] }}>
                <MaterialIcons name="star" size={42} color="#FFC928" />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: star3Scale }] }}>
                <MaterialIcons name="star" size={36} color="#FFC928" />
              </Animated.View>
            </View>`;

content = content.replace(originalModal, animatedModal);

fs.writeFileSync(path, content, 'utf8');
console.log('GameView updated successfully');
