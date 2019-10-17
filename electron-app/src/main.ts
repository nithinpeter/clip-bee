import * as path from 'path';
import { app, shell, Menu, Tray, nativeImage } from 'electron';

import { start as serverStart, stop as serverStop } from './server/main';
import { SERVER_PORT } from './constants';

app.on('ready', async () => {
  const image = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon-real.png')
  );
  image.setTemplateImage(true);
  const tray = new Tray(image);

  // Call this again for Linux because we modified the context menu

  setContextMenu(tray);
  tray.setToolTip('Clip Bee');

  // start the app if openAtLogin === true
  if (getOpenAtLogin()) {
    serverStart();
  }
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
      click: () => shell.openExternal('http://localhost:' + SERVER_PORT),
    },

    { type: 'separator' },

    {
      label: 'Quit',
      click: async () => {
        app.quit();
        await serverStop();
      },
    },
  ]);
};
