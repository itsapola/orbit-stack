import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, GROUND_HEIGHT } from '../theme';

const scoreBadgeFrame = require('../../assets/ui/score_badge_frame_empty.png');

// Real illustrated pieces, cycled by stack index. Order chosen so the base is
// visually "heaviest" (pedestal) and the tower gets lighter/smaller-feeling
// toward the top (satellites, saucer) — matches the mockups' composition.
const OBJECT_SPRITES = [
  require('../../assets/objects/pedestal_table.png'),
  require('../../assets/objects/boomerang_table_2.png'),
  require('../../assets/objects/starburst_clock.png'),
  require('../../assets/objects/toaster_a.png'),
  require('../../assets/objects/boomerang_table_1.png'),
  require('../../assets/objects/toaster_b.png'),
  require('../../assets/objects/ufo_saucer.png'),
  require('../../assets/objects/satellite_1.png'),
  require('../../assets/objects/satellite_2.png'),
  require('../../assets/objects/new_pedestal.png'),
  require('../../assets/objects/new_tv.png'),
  require('../../assets/objects/new_turntable.png'),
  require('../../assets/objects/new_clock.png'),
  require('../../assets/objects/new_toaster.png'),
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BLOCK_HEIGHT = 46;
const BASE_WIDTH = Math.min(240, SCREEN_WIDTH * 0.62);
const ACTIVE_Y = SCREEN_HEIGHT * 0.28; // fixed on-screen height for the moving block
const VISIBLE_BLOCKS = Math.max(
  3,
  Math.floor((SCREEN_HEIGHT - ACTIVE_Y - GROUND_HEIGHT) / BLOCK_HEIGHT)
);
const PERFECT_TOLERANCE = 6; // px of allowed drift to still count as "perfect"
const BASE_DURATION = 1400; // ms to cross full width at level 1
const MIN_DURATION = 650; // fastest the block will ever move
const MIN_PLAYABLE_WIDTH = 26; // below this, the run is effectively over

let blockKeyCounter = 0;

export default function GameScreen({ onGameOver }) {
  const [stack, setStack] = useState(() => [
    {
      key: 'base',
      x: (SCREEN_WIDTH - BASE_WIDTH) / 2,
      width: BASE_WIDTH,
      colorIndex: 0,
    },
  ]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [popText, setPopText] = useState(null);
  const [activeWidth, setActiveWidth] = useState(BASE_WIDTH);

  const activeWidthRef = useRef(BASE_WIDTH);
  const activeX = useRef(new Animated.Value(0)).current;
  const currentXRef = useRef(0);
  const isLockedRef = useRef(false);
  const stackTranslateY = useRef(new Animated.Value(0)).current;

  const startMoving = useCallback(
    (width, level) => {
      const bound = Math.max(SCREEN_WIDTH - width, 1);
      const duration = Math.max(MIN_DURATION, BASE_DURATION - level * 35);
      const fromEdge = level % 2 === 0 ? 0 : bound;
      activeX.setValue(fromEdge);
      currentXRef.current = fromEdge;

      const step = () => {
        if (isLockedRef.current) return;
        const target = currentXRef.current >= bound ? 0 : bound;
        Animated.timing(activeX, {
          toValue: target,
          duration,
          useNativeDriver: false,
        }).start(({ finished }) => {
          currentXRef.current = target;
          if (finished && !isLockedRef.current) step();
        });
      };
      step();
    },
    [activeX]
  );

  useEffect(() => {
    const listenerId = activeX.addListener(({ value }) => {
      currentXRef.current = value;
    });
    startMoving(BASE_WIDTH, 0);
    return () => activeX.removeListener(listenerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endGame = useCallback(
    (finalScore) => {
      isLockedRef.current = true;
      activeX.stopAnimation();
      setTimeout(() => onGameOver(finalScore), 250);
    },
    [activeX, onGameOver]
  );

  const handleDrop = useCallback(() => {
    if (isLockedRef.current) return;

    const prevBlock = stack[stack.length - 1];
    const x = currentXRef.current;
    const width = activeWidthRef.current;

    const overlapLeft = Math.max(x, prevBlock.x);
    const overlapRight = Math.min(x + width, prevBlock.x + prevBlock.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 4) {
      endGame(score);
      return;
    }

    isLockedRef.current = true;
    activeX.stopAnimation();

    const isPerfect =
      Math.abs(overlapWidth - prevBlock.width) <= PERFECT_TOLERANCE ||
      Math.abs(overlapWidth - width) <= PERFECT_TOLERANCE;

    const newBlock = {
      key: `b${blockKeyCounter++}`,
      x: overlapLeft,
      width: overlapWidth,
      colorIndex: stack.length,
    };

    const newStack = [...stack, newBlock];
    setStack(newStack);
    activeWidthRef.current = overlapWidth;
    setActiveWidth(overlapWidth);

    const newCombo = isPerfect ? combo + 1 : 0;
    setCombo(newCombo);
    const gained = isPerfect ? 3 + newCombo : 1;
    const newScore = score + gained;
    setScore(newScore);

    if (isPerfect) {
      setPopText(newCombo > 1 ? `PERFECT x${newCombo}` : 'PERFECT');
      setTimeout(() => setPopText(null), 500);
    }

    if (newStack.length > VISIBLE_BLOCKS) {
      Animated.timing(stackTranslateY, {
        toValue: (newStack.length - VISIBLE_BLOCKS) * BLOCK_HEIGHT,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }

    if (overlapWidth < MIN_PLAYABLE_WIDTH) {
      setTimeout(() => endGame(newScore), 300);
      return;
    }

    setTimeout(() => {
      isLockedRef.current = false;
      startMoving(overlapWidth, newStack.length);
    }, 120);
  }, [stack, combo, score, endGame, startMoving, stackTranslateY, activeX]);

  return (
    <TouchableWithoutFeedback onPress={handleDrop}>
      <View style={styles.container}>
        <View style={styles.sky}>
          <View style={styles.moon} />
        </View>

        <ImageBackground
          source={scoreBadgeFrame}
          resizeMode="stretch"
          style={styles.scoreBadge}
          imageStyle={styles.scoreBadgeImage}
        >
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{String(score).padStart(5, '0')}</Text>
        </ImageBackground>

        {popText && (
          <View style={styles.popBadge}>
            <Text style={styles.popText}>{popText}</Text>
          </View>
        )}

        <Animated.View
          style={[styles.stackContainer, { transform: [{ translateY: stackTranslateY }] }]}
        >
          {stack.map((block, i) => (
            <Image
              key={block.key}
              source={OBJECT_SPRITES[block.colorIndex % OBJECT_SPRITES.length]}
              resizeMode="stretch"
              style={[
                styles.block,
                {
                  left: block.x,
                  width: block.width,
                  bottom: GROUND_HEIGHT + i * BLOCK_HEIGHT,
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.Image
          source={OBJECT_SPRITES[stack.length % OBJECT_SPRITES.length]}
          resizeMode="stretch"
          style={[
            styles.block,
            styles.activeBlock,
            {
              left: activeX,
              width: activeWidth,
              top: ACTIVE_Y,
            },
          ]}
        />

        <View style={styles.ground} />
        <Text style={styles.hint}>TAP TO DROP</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: colors.skyTop,
  },
  moon: {
    position: 'absolute',
    top: 50,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cream,
  },
  scoreBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 150,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scoreBadgeImage: {
    // stretch is applied via resizeMode on ImageBackground; nothing extra needed here
  },
  scoreLabel: { color: colors.skyTop, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  scoreValue: { color: colors.coralAccent, fontWeight: '900', fontSize: 20 },
  popBadge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 10,
  },
  popText: { color: colors.mustard, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  stackContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  block: {
    position: 'absolute',
    height: BLOCK_HEIGHT - 4,
  },
  activeBlock: {
    position: 'absolute',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    backgroundColor: colors.ground,
  },
  hint: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: colors.cream,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.7,
  },
});
