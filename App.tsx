import React, { useState } from 'react';
import SetupScreen from './src/screens/SetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallScreen from './src/screens/CallScreen';

type Screen = 'setup' | 'home' | 'call';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('setup');
  const [username, setUsername] = useState('');
  const [channelId, setChannelId] = useState('');

  const handleReady = (name: string) => {
    setUsername(name);
    setScreen('home');
  };

  const handleCall = (id: string) => {
    setChannelId(id);
    setScreen('call');
  };

  if (screen === 'setup') {
    return <SetupScreen onReady={handleReady} />;
  }

  if (screen === 'call') {
    return <CallScreen channelId={channelId} onEnd={() => setScreen('home')} />;
  }

  return (
    <HomeScreen
      username={username}
      onStartCall={handleCall}
      onJoinCall={handleCall}
    />
  );
}

export default App;
