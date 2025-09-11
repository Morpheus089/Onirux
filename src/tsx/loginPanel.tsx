import React, { useState } from 'react';
import '../css/loginPanel.css';

const LoginPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      console.log('handleLogin', { username });
      const result = await window.electronAPI.checkLogin(username, password);

      if (!result.success) {
        console.log('login fail');
        setError('Identifiants incorrects');
        setPassword('');
      } else {
        console.log('login success');
        alert('Connexion réussie !');
      }
    } catch (err: any) {
      console.error('handleLogin error', err);
      setError(`Erreur lors de la connexion : ${err.message}`);
    }
  };

  return (
    <div className="login-panel">
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>接続</button>

      {error && (
        <div style={{ color: '#ff6666', fontSize: '0.9rem', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LoginPanel;