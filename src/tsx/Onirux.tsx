import React, { useState } from 'react';
import BackgroundRain from './backgroundRain';
import LoginPanel from './loginPanel';
import Accueil from './accueil';

const Onirux: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <BackgroundRain />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        {isLoggedIn ? (
          <Accueil />
        ) : (
          <LoginPanel onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default Onirux;