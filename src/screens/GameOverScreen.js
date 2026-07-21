import React, { useEffect, useState } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const toppledLockup = require('../../assets/ui/toppled_lockup.png');
const newBestBadge = require('../../assets/ui/new_best_badge.png');
const playAgainButton = require('../../assets/ui/play_again_button.png');
const menuButton = require('../../assets/ui/menu_button.png');
const scoreBadgeFrame = require('../../assets/ui/score_badge_frame_empty.png');

export default function GameOverScreen({ score, onPlayAgain, onMenu }) {
  const [highScore, setHighScore] = useState(score);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('orbitstack_highscore');
      const prevBest = stored ? parseInt(stored, 10) : 0;
      if (score > prevBest) {
        await AsyncStorage.setItem('orbitstack_highscore', String(score));
        setHighScore(score);
        setIsNewBest(true);
      } else {
        setHighScore(prevBest);
      }
    })();
  }, [score]);

  return (
    <View style={styles.container}>
      <Image source={toppledLockup} style={styles.toppledImage} resizeMode="contain" />

      {isNewBest && (
        <Image source={newBestBadge} style={styles.newBestImage} resizeMode="contain" />
      )}

      <ImageBackground
        source={scoreBadgeFrame}
        resizeMode="stretch"
        style={styles.scoreCard}
      >
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{String(score).padStart(5, '0')}</Text>
        <Text style={styles.bestLabel}>BEST {String(highScore).padStart(5, '0')}</Text>
      </ImageBackground>

      <TouchableOpacity onPress={onPlayAgain} activeOpacity={0.8}>
        <Image source={playAgainButton} style={styles.buttonImage} resizeMode="contain" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onMenu} activeOpacity={0.8} style={styles.menuTap}>
        <Image source={menuButton} style={styles.menuButtonImage} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toppledImage: {
    width: 300,
    height: 173,
  },
  newBestImage: {
    marginTop: -10,
    width: 90,
    height: 86,
  },
  scoreCard: {
    marginTop: 30,
    width: 260,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: { color: colors.skyTop, fontWeight: '700', letterSpacing: 2 },
  scoreValue: { color: colors.coralAccent, fontWeight: '900', fontSize: 36 },
  bestLabel: { marginTop: 6, color: colors.charcoal, fontWeight: '600' },
  buttonImage: {
    marginTop: 40,
    width: 220,
    height: 64,
  },
  menuTap: { marginTop: 12, padding: 6 },
  menuButtonImage: {
    width: 180,
    height: 52,
  },
});
