const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fromDarkness', {
  runtime: 'electron',
  privacy: 'local-only-prototype',
  getContentDatabase: () => ipcRenderer.invoke('content:database'),
  checkForUpdate: () => ipcRenderer.invoke('app:update-check'),
  installUpdate: () => ipcRenderer.invoke('app:update-install'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  onUpdateStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('update:status', listener);
    return () => ipcRenderer.removeListener('update:status', listener);
  },
});
