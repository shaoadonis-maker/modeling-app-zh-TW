import type { BrowserWindow } from 'electron'

import { sendMenuAction } from '@src/menu/channels'
import type { ZooMenuItemConstructorOptions } from '@src/menu/roles'
import { isMac } from '@src/menu/utils'

export const projectViewRole = (
  mainWindow: BrowserWindow
): ZooMenuItemConstructorOptions => {
  let extraBits: ZooMenuItemConstructorOptions[] = [{ role: 'close' }]
  if (isMac) {
    extraBits = [
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' },
    ]
  }
  return {
    label: '檢視 View',
    submenu: [
      {
        label: '命令面板 Command Palette...',
        id: 'View.Command Palette...',
        click: sendMenuAction(mainWindow, 'View.Command Palette...'),
      },
      {
        label: '外觀 Appearance',
        submenu: [
          { role: 'togglefullscreen' },
          { type: 'separator' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { role: 'resetZoom' },
        ],
      },
      { type: 'separator' },
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'toggleDevTools' },
      ...extraBits,
    ],
  }
}

export const modelingViewRole = (
  mainWindow: BrowserWindow
): ZooMenuItemConstructorOptions => {
  let extraBits: ZooMenuItemConstructorOptions[] = [{ role: 'close' }]
  if (isMac) {
    extraBits = [
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' },
    ]
  }
  return {
    label: '檢視 View',
    submenu: [
      {
        label: '命令面板 Command Palette...',
        id: 'View.Command Palette...',
        click: sendMenuAction(mainWindow, 'View.Command Palette...'),
      },
      { type: 'separator' },
      {
        label: '正交視圖 Orthographic View',
        id: 'View.Orthographic view',
        click: sendMenuAction(mainWindow, 'View.Orthographic view'),
      },
      {
        label: '透視視圖 Perspective View',
        id: 'View.Perspective view',
        click: sendMenuAction(mainWindow, 'View.Perspective view'),
      },
      { type: 'separator' },
      {
        label: '標準視圖 Standard Views',
        id: 'View.Standard views',
        submenu: [
          {
            label: '右視圖 Right View',
            id: 'View.Standard views.Right view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Right view'),
          },
          {
            label: '後視圖 Back View',
            id: 'View.Standard views.Back view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Back view'),
          },
          {
            label: '上視圖 Top View',
            id: 'View.Standard views.Top view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Top view'),
          },
          {
            label: '左視圖 Left View',
            id: 'View.Standard views.Left view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Left view'),
          },
          {
            label: '前視圖 Front View',
            id: 'View.Standard views.Front view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Front view'),
          },
          {
            label: '下視圖 Bottom View',
            id: 'View.Standard views.Bottom view',
            click: sendMenuAction(
              mainWindow,
              'View.Standard views.Bottom view'
            ),
          },
          { type: 'separator' },
          {
            label: '重設視圖 Reset View',
            id: 'View.Standard views.Reset view',
            click: sendMenuAction(mainWindow, 'View.Standard views.Reset view'),
          },
          {
            label: '將視圖置中於選取項目 Center View on Selection',
            id: 'View.Standard views.Center view on selection',
            click: sendMenuAction(
              mainWindow,
              'View.Standard views.Center view on selection'
            ),
          },
        ],
      },
      {
        label: '命名視圖 Named Views',
        id: 'View.Named views',
        submenu: [
          {
            label: '建立命名視圖 Create Named View',
            id: 'View.Named views.Create named view',
            click: sendMenuAction(
              mainWindow,
              'View.Named views.Create named view'
            ),
          },
          {
            label: '載入命名視圖 Load Named View',
            id: 'View.Named views.Load named view',
            click: sendMenuAction(
              mainWindow,
              'View.Named views.Load named view'
            ),
          },
          {
            label: '刪除命名視圖 Delete Named View',
            id: 'View.Named views.Delete named view',
            click: sendMenuAction(
              mainWindow,
              'View.Named views.Delete named view'
            ),
          },
        ],
      },
      { type: 'separator' },
      {
        label: '面板 Panes',
        submenu: [
          {
            label: '特徵樹 Feature tree',
            id: 'View.Panes.Feature tree',
            click: sendMenuAction(mainWindow, 'View.Panes.Feature tree'),
          },
          {
            label: 'KCL 程式碼 KCL code',
            id: 'View.Panes.KCL code',
            click: sendMenuAction(mainWindow, 'View.Panes.KCL code'),
          },
          {
            label: '專案檔案 Project files',
            id: 'View.Panes.Project files',
            click: sendMenuAction(mainWindow, 'View.Panes.Project files'),
          },
          {
            label: '變數 Variables',
            id: 'View.Panes.Variables',
            click: sendMenuAction(mainWindow, 'View.Panes.Variables'),
          },
          {
            label: '記錄 Logs',
            id: 'View.Panes.Logs',
            click: sendMenuAction(mainWindow, 'View.Panes.Logs'),
          },
          {
            label: 'Zookeeper',
            id: 'View.Panes.Zookeeper',
            click: sendMenuAction(mainWindow, 'View.Panes.Zookeeper'),
          },
        ],
      },
      {
        label: '外觀 Appearance',
        submenu: [
          { role: 'togglefullscreen' },
          { type: 'separator' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { role: 'resetZoom' },
        ],
      },
      { type: 'separator' },
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'toggleDevTools' },
      ...extraBits,
    ],
  }
}
