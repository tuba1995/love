import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import GiftScreen from './components/GiftScreen';
import LoginScreen from './components/LoginScreen';
import StaircaseJourney from './components/StaircaseJourney';
import ComingSoonScreen from './components/ComingSoonScreen';

const SCREENS = {
  GIFT: 'gift',
  LOGIN: 'login',
  MAIN: 'main',
  COMING_SOON: 'coming-soon',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.GIFT);

  return (
    <div className="min-h-svh w-full">
      <AnimatePresence mode="wait">
        {screen === SCREENS.GIFT && (
          <GiftScreen
            key="gift"
            onOpen={() => setScreen(SCREENS.LOGIN)}
            onQuestComplete={() => setScreen(SCREENS.COMING_SOON)}
          />
        )}
        {screen === SCREENS.LOGIN && (
          <LoginScreen key="login" onSuccess={() => setScreen(SCREENS.MAIN)} />
        )}
        {screen === SCREENS.MAIN && <StaircaseJourney key="main" />}
        {screen === SCREENS.COMING_SOON && (
          <ComingSoonScreen key="coming-soon" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
