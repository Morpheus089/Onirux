import React from 'react';

const Accueil: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#00ff00',
      fontFamily: 'monospace',
      background: 'transparent'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        Welcome to Onirux
      </h1>
      
      <div style={{
        padding: '2rem',
        border: '2px solid #00ff00',
        borderRadius: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}>
        <p style={{ fontSize: '1.2rem', textAlign: 'center' }}>
          Connexion réussie !<br/>
          Bienvenue dans le système Onirux
        </p>
      </div>

      <button 
        style={{
          marginTop: '2rem',
          padding: '10px 20px',
          backgroundColor: 'transparent',
          border: '2px solid #00ff00',
          color: '#00ff00',
          cursor: 'pointer',
          fontSize: '1rem',
          borderRadius: '5px'
        }}
        onClick={() => window.location.reload()}
      >
        Déconnexion
      </button>
    </div>
  );
};

export default Accueil;