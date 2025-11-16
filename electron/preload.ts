// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openUrl: (url: string) => {
    ipcRenderer.send("open-url", url);
  }
});

declare global {
  interface Window {
    electronAPI: {
      openUrl: (url: string) => Promise<void>;
    };
  }
}
