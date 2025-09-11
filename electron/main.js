import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('check-login', async (event, { username, password }) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT password_hash FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    if (!rows[0]) {
      return { success: false };
    }
    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) {
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  } finally {
    if (conn) conn.release();
  }
});