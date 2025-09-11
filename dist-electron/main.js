"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const mariadb_1 = __importDefault(require("mariadb"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const isDev = !electron_1.app.isPackaged;
const pool = mariadb_1.default.createPool({
    host: 'echoesofavalone.falixsrv.me',
    port: 23003,
    user: 'u2234829_f0VCVth5WE',
    password: 'GzE@xMj.2.Cq.AYlP6C6XODw',
    database: 's2234829_Onirux',
    connectionLimit: 5
});
async function ensureUsersTable(conn) {
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    )`);
}
async function initDb() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('init: connected');
        await ensureUsersTable(conn);
        if (isDev) {
            const hash = '$2b$10$BiLq2WUcDUbKR7MbV93lsOp8.7uxce6sxKq8dlI/crhJaZwQ0spsi';
            await conn.query('INSERT INTO users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)', ['test', hash]);
            console.log('init: table ensured and test user upserted (dev only)');
        }
    }
    catch (e) {
        console.error('init error', e);
    }
    finally {
        if (conn)
            conn.release();
    }
}
function applyProdCSP() {
    if (isDev)
        return;
    const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [csp],
            },
        });
    });
}
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    win.setMenuBarVisibility(false);
    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
}
electron_1.app.whenReady().then(async () => {
    console.log('app ready');
    applyProdCSP();
    await initDb();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.ipcMain.handle('check-login', async (event, { username, password }) => {
    console.log('check-login received', { username });
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('db connected');
        // Ensure table exists on demand
        await ensureUsersTable(conn);
        const rows = await conn.query('SELECT password_hash FROM users WHERE username = ? LIMIT 1', [username]);
        if (!rows[0]) {
            console.log('user not found');
            return { success: false };
        }
        const match = await bcrypt_1.default.compare(password, rows[0].password_hash);
        if (!match) {
            console.log('bad password');
            return { success: false };
        }
        console.log('login ok');
        return { success: true };
    }
    catch (err) {
        console.error('login error', err);
        return { success: false };
    }
    finally {
        if (conn)
            conn.release();
    }
});
