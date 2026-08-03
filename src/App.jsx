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
  // Mật khẩu 6 số cho màn Login sau khi hoàn thành nhiệm vụ trong hộp quà —
  // do GiftScreen tính ra (mảnh ghép 1 + 2 + 3) và truyền lên qua
  // onQuestComplete, vì giá trị này ngẫu nhiên theo từng lượt chơi chứ
  // không cố định như SITE.password.
  const [loginTarget, setLoginTarget] = useState('');

  return (
    <div className="min-h-svh w-full">
      <AnimatePresence mode="wait">
        {screen === SCREENS.GIFT && (
          <GiftScreen
            key="gift"
            onOpen={() => setScreen(SCREENS.LOGIN)}
            onQuestComplete={(password) => {
              setLoginTarget(password);
              setScreen(SCREENS.LOGIN);
            }}
          />
        )}
        {screen === SCREENS.LOGIN && (
          <LoginScreen
            key="login"
            target={loginTarget}
            onSuccess={() => setScreen(SCREENS.COMING_SOON)}
            onLockout={() => setScreen(SCREENS.GIFT)}
          />
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
