import { useState } from 'react';
import BackgroundRain from './backgroundRain';
import LoginPanel from './loginPanel';
import Accueil from './accueil';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      <BackgroundRain />
      {isLoggedIn ? (
        <Accueil />
      ) : (
        <LoginPanel onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;