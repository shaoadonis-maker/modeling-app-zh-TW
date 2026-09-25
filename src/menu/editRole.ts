import type { BrowserWindow } from 'electron'

import { sendMenuAction } from '@src/menu/channels'
import type { ZooMenuItemConstructorOptions } from '@src/menu/roles'
import { isMac } from '@src/menu/utils'

export const projectEditRole = (
  mainWindow: BrowserWindow
): ZooMenuItemConstructorOptions => {
  let extraBits: ZooMenuItemConstructorOptions[] = [
    { role: 'delete' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]
  if (isMac) {
    extraBits = [
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: '語音 Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
      },
    ]
  }
  return {
    label: '編輯 Edit',
    submenu: [
      {
        label: '重新命名專案 Rename Project',
        id: 'Edit.Rename project',
        click: sendMenuAction(mainWindow, 'Edit.Rename project'),
      },
      {
        label: '刪除專案 Delete Project',
        id: 'Edit.Delete project',
        click: sendMenuAction(mainWindow, 'Edit.Delete project'),
      },
      { type: 'separator' },
      {
        label: '管理專案資料庫 Manage Project Libraries',
        id: 'Edit.Change project directory',
        click: sendMenuAction(mainWindow, 'Edit.Change project directory'),
      },
      { type: 'separator' },
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...extraBits,
    ],
  }
}

export const modelingEditRole = (
  mainWindow: BrowserWindow
): ZooMenuItemConstructorOptions => {
  let extraBits: ZooMenuItemConstructorOptions[] = [
    { role: 'delete' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]
  if (isMac) {
    extraBits = [
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: '語音 Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
      },
    ]
  }
  return {
    label: '編輯 Edit',
    submenu: [
      {
        label: '編輯參數 Edit Parameter',
        id: 'Edit.Edit parameter',
        click: sendMenuAction(mainWindow, 'Edit.Edit parameter'),
      },
      {
        label: '格式化程式碼 Format Code',
        id: 'Edit.Format code',
        accelerator: 'Alt+Shift+F',
        click: sendMenuAction(mainWindow, 'Edit.Format code'),
      },
      { type: 'separator' },
      {
        label: '重新命名專案 Rename Project',
        id: 'Edit.Rename project',
        click: sendMenuAction(mainWindow, 'Edit.Rename project'),
      },
      {
        label: '刪除專案 Delete Project',
        id: 'Edit.Delete project',
        click: sendMenuAction(mainWindow, 'Edit.Delete project'),
      },
      { type: 'separator' },
      {
        label: '管理專案資料庫 Manage Project Libraries',
        id: 'Edit.Change project directory',
        click: sendMenuAction(mainWindow, 'Edit.Change project directory'),
      },
      { type: 'separator' },
      {
        label: '復原 Undo',
        accelerator: 'CmdOrCtrl+Z',
        click: sendMenuAction(mainWindow, 'Edit.Undo'),
      },
      {
        label: '重做 Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        click: sendMenuAction(mainWindow, 'Edit.Redo'),
      },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...extraBits,
    ],
  }
}
