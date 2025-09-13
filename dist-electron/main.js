"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const mariadb_1 = __importDefault(require("mariadb"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = require("fs");
const isDev = !electron_1.app.isPackaged;
let mainWindow = null;
let hiddenWindow = null;
let tray = null;
let isQuitting = false;
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
    }
    catch (e) {
        console.error('init error', e);
    }
    finally {
        if (conn)
            conn.release();
    }
}
function createHiddenWindow() {
    hiddenWindow = new electron_1.BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    if (isDev) {
        hiddenWindow.loadURL('http://localhost:5173');
    }
    else {
        hiddenWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    hiddenWindow.on('closed', () => {
        if (!isQuitting) {
            createHiddenWindow();
        }
    });
}
function createTray() {
    try {
        let trayIcon;
        const iconPath = isDev
            ? path_1.default.join(__dirname, '../src/assets/logo.ico')
            : path_1.default.join(process.resourcesPath, 'assets', 'logo.ico');
        if ((0, fs_1.existsSync)(iconPath)) {
            trayIcon = electron_1.nativeImage.createFromPath(iconPath);
        }
        else {
            trayIcon = electron_1.nativeImage.createEmpty();
        }
        tray = new electron_1.Tray(trayIcon);
        const contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: 'Ouvrir Onirux',
                click: () => {
                    showWindow();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quitter',
                click: () => {
                    isQuitting = true;
                    electron_1.app.quit();
                }
            }
        ]);
        tray.setContextMenu(contextMenu);
        tray.setToolTip('Onirux - Animation en cours');
        tray.on('click', () => {
            showWindow();
        });
        tray.on('double-click', () => {
            showWindow();
        });
    }
    catch (error) {
        console.log('Tray non disponible, continuons sans...');
    }
}
function showWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
    }
    else {
        createWindow();
    }
}
function applyProdCSP() {
    if (isDev)
        return;
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
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
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
            backgroundThrottling: false,
        },
    });
    mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.webContents.on('dom-ready', () => {
        mainWindow?.webContents.executeJavaScript(`
      document.addEventListener('visibilitychange', function() {
        console.log('Visibility changed:', document.visibilityState);
      });
    `);
    });
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
            console.log('Fenêtre cachée - Animation continue en arrière-plan');
            return false;
        }
    });
    mainWindow.on('minimize', () => {
        if (!isQuitting) {
            mainWindow?.hide();
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.commandLine.appendSwitch('disable-background-timer-throttling');
electron_1.app.commandLine.appendSwitch('disable-renderer-backgrounding');
electron_1.app.on('ready', async () => {
    console.log('app ready');
    applyProdCSP();
    await initDb();
    createHiddenWindow();
    createTray();
    createWindow();
});
electron_1.app.on('window-all-closed', () => {
    return;
});
electron_1.app.on('activate', () => {
    showWindow();
});
electron_1.app.on('before-quit', () => {
    isQuitting = true;
});
electron_1.ipcMain.handle('check-login', async (event, { username, password }) => {
    console.log('check-login received', { username });
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('db connected');
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
