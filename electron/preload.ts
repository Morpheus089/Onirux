import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  checkLogin: (username: string, password: string) => {
    console.log('preload checkLogin', { username });
    return ipcRenderer.invoke('check-login', { username, password });
  },
});