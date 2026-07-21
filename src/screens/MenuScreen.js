import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const scoreBadgeFrame = require('../../assets/ui/score_badge_frame_empty.png');

export default function MenuScreen({ onPlay }) {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('orbitstack_highscore').then((v) => {
      if (v) setHighScore(parseInt(v, 10));
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.skyDecor}>
        <View style={styles.moon} />
        <Text style={[styles.star, { top: 60, left: 50 }]}>✦</Text>
        <Text style={[styles.star, { top: 150, left: 30 }]}>✦</Text>
        <Text style={[styles.star, { top: 90, right: 100 }]}>✦</Text>
      </View>

      <Text style={styles.title}>ORBIT{'\n'}STACK</Text>

      <ImageBackground
        source={scoreBadgeFrame}
        resizeMode="stretch"
        style={styles.highScoreBadge}
      >
        <Text style={styles.highScoreLabel}>BEST</Text>
        <Text style={styles.highScoreValue}>{String(highScore).padStart(5, '0')}</Text>
      </ImageBackground>

      <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.8}>
        <Text style={styles.playButtonText}>✳  TAP TO PLAY  ✳</Text>
      </TouchableOpacity>

      <View style={styles.skyline}>
        <View style={[styles.towerShape, { width: 18, height: 70 }]} />
        <View style={[styles.towerShape, { width: 30, height: 100 }]} />
        <View style={[styles.towerShape, { width: 16, height: 55 }]} />
        <View style={[styles.towerShape, { width: 26, height: 85 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBottom,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skyDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: colors.skyTop,
  },
  moon: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.cream,
  },
  star: {
    position: 'absolute',
    color: colors.cream,
    fontSize: 18,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 54,
    marginTop: 30,
    letterSpacing: 2,
  },
  highScoreBadge: {
    marginTop: 24,
    width: 170,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highScoreLabel: { color: colors.skyTop, fontWeight: '700', letterSpacing: 2 },
  highScoreValue: { color: colors.coralAccent, fontWeight: '900', fontSize: 22 },
  playButton: {
    marginTop: 50,
    backgroundColor: colors.coralAccent,
    borderWidth: 3,
    borderColor: colors.cream,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  playButtonText: { color: colors.cream, fontWeight: '800', fontSize: 18, letterSpacing: 1 },
  skyline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: colors.ground,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 0,
  },
  towerShape: {
    backgroundColor: colors.charcoal,
    opacity: 0.45,
  },
});
