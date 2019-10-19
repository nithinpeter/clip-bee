import * as path from 'path';
import { app, shell, Menu, Tray, nativeImage } from 'electron';

import { start as serverStart, stop as serverStop } from './app/api/main';
import { SERVER_HOST, SERVER_PORT } from './constants';

app.on('activate', () => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('ready', async () => {
  const image = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon-real.png')
  );
  image.setTemplateImage(true);
  const tray = new Tray(image);

  // Call this again for Linux because we modified the context menu
  setContextMenu(tray);
  tray.setToolTip('Clip Bee');

  // Start the server
  serverStart();
});

if (process.platform === 'darwin') {
  app.dock.hide();
}

const getOpenAtLogin = (): boolean => {
  return app.getLoginItemSettings().openAtLogin;
};

const toggleOpenAtLogin = () => {
  const openAtLogin = getOpenAtLogin();
  app.setLoginItemSettings({
    openAtLogin: !openAtLogin,
  });
};

const setContextMenu = (tray: Tray) => {
  const menu = getContextMenu();
  tray.setContextMenu(menu);
};

const getContextMenu = () => {
  return Menu.buildFromTemplate([
    { label: 'Preferences...' },
    {
      label: 'Open at login',
      type: 'checkbox',
      click: toggleOpenAtLogin,
      checked: getOpenAtLogin(),
    },

    { type: 'separator' },

    {
      label: 'View clipboard history',
      click: () => shell.openExternal(`http://${SERVER_HOST}:${SERVER_PORT}`),
    },

    { type: 'separator' },

    {
      label: 'Quit',
      click: async () => {
        await serverStop();
        app.quit();
      },
    },
  ]);
};
