import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Détection mode développement
const isDev = process.env.NODE_ENV === 'development';

// Pool MariaDB
const pool = mariadb.createPool({
  host: 'echoesofavalone.falixsrv.me',
  port: 23003,
  user: 'u2234829_f0VCVth5WE',
  password: 'GzE@xMj.2.Cq.AYlP6C6XODw',
  database: 's2234829_Onirux',
  connectionLimit: 5
});

// Crée la fenêtre principale
function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,      // Permet d'utiliser Node.js dans le renderer
      contextIsolation: false,    // Nécessaire pour ipcRenderer
    },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    // En dev : charge Vite (React) sur le port 5173
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // En prod : charge le build React compilé dans dist/
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Événements Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Communication Renderer ↔ Main : vérification login
ipcMain.handle('check-login', async (event, { username, password }) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT password_hash FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (!rows[0]) return { success: false };

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return { success: false };

    return { success: true };
  } catch (err) {
    console.error('Erreur login:', err);
    return { success: false };
  } finally {
    if (conn) conn.release();
  }
});