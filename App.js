import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import { colors } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing' | 'gameover'
  const [lastScore, setLastScore] = useState(0);

  const handleGameOver = (finalScore) => {
    setLastScore(finalScore);
    setScreen('gameover');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {screen === 'menu' && <MenuScreen onPlay={() => setScreen('playing')} />}
      {screen === 'playing' && <GameScreen onGameOver={handleGameOver} />}
      {screen === 'gameover' && (
        <GameOverScreen
          score={lastScore}
          onPlayAgain={() => setScreen('playing')}
          onMenu={() => setScreen('menu')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyTop },
});
