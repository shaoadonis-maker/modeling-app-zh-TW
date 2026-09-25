import { sendMenuAction } from '@src/menu/channels'
import type { ZooMenuItemConstructorOptions } from '@src/menu/roles'
import type { BrowserWindow } from 'electron'

export const modelingDesignRole = (
  mainWindow: BrowserWindow
): ZooMenuItemConstructorOptions => {
  return {
    label: '設計 Design',
    submenu: [
      {
        label: '開始草圖 Start Sketch',
        id: 'Design.Start sketch',
        click: sendMenuAction(mainWindow, 'Design.Start sketch'),
      },
      { type: 'separator' },
      {
        label: '建立偏移平面 Create an Offset Plane',
        id: 'Design.Create an offset plane',
        click: sendMenuAction(mainWindow, 'Design.Create an offset plane'),
      },
      {
        label: '建立螺旋線 Create a Helix',
        id: 'Design.Create a helix',
        click: sendMenuAction(mainWindow, 'Design.Create a helix'),
      },
      {
        label: '建立參數 Create a Parameter',
        id: 'Design.Create a parameter',
        click: sendMenuAction(mainWindow, 'Design.Create a parameter'),
      },
      { type: 'separator' },
      {
        label: '建立加料特徵 Create an Additive Feature',
        id: 'Design.Create an additive feature',
        submenu: [
          {
            label: '擠出 Extrude',
            id: 'Design.Create an additive feature.Extrude',
            click: sendMenuAction(
              mainWindow,
              'Design.Create an additive feature.Extrude'
            ),
          },
          {
            label: '旋轉 Revolve',
            id: 'Design.Create an additive feature.Revolve',
            click: sendMenuAction(
              mainWindow,
              'Design.Create an additive feature.Revolve'
            ),
          },
          {
            label: '掃掠 Sweep',
            id: 'Design.Create an additive feature.Sweep',
            click: sendMenuAction(
              mainWindow,
              'Design.Create an additive feature.Sweep'
            ),
          },
          {
            label: '放樣 Loft',
            id: 'Design.Create an additive feature.Loft',
            click: sendMenuAction(
              mainWindow,
              'Design.Create an additive feature.Loft'
            ),
          },
        ],
      },
      {
        label: '套用修改特徵 Apply Modification Feature',
        id: 'Design.Apply modification feature',
        submenu: [
          {
            label: '圓角 Fillet',
            id: 'Design.Apply modification feature.Fillet',
            click: sendMenuAction(
              mainWindow,
              'Design.Apply modification feature.Fillet'
            ),
          },
          {
            label: '倒角 Chamfer',
            id: 'Design.Apply modification feature.Chamfer',
            click: sendMenuAction(
              mainWindow,
              'Design.Apply modification feature.Chamfer'
            ),
          },
          {
            label: '薄殼 Shell',
            id: 'Design.Apply modification feature.Shell',
            click: sendMenuAction(
              mainWindow,
              'Design.Apply modification feature.Shell'
            ),
          },
        ],
      },
      { type: 'separator' },
      {
        label: '從專案檔案匯入 Import from Project File',
        id: 'Design.Insert from project file',
        click: sendMenuAction(mainWindow, 'Design.Insert from project file'),
      },
    ],
  }
}
