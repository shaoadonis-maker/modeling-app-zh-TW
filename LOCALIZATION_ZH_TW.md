# Zoo Design Studio 繁體中文化（zh-TW）

此分支用於建立 Zoo Design Studio 的繁體中文介面。

## 目標

- 保留英文 CAD 專有名詞，採「中文 + English」顯示方式
- 優先處理工程建模常用功能
- 不修改 KCL 語法與模型資料格式
- 讓中文化盡量與上游 Zoo 更新解耦

## 第一階段

1. 建立輕量 i18n 層
2. 建立繁體中文 CAD 詞彙表
3. 中文化 Toolbar / Command Bar / Settings
4. 加入 English / 繁體中文切換
5. 補上基本測試

## 翻譯原則

- Sketch → 草圖 Sketch
- Extrude → 擠出 Extrude
- Fillet → 圓角 Fillet
- Chamfer → 倒角 Chamfer
- Loft → 放樣 Loft
- Sweep → 掃掠 Sweep
- Shell → 薄殼 Shell
- Constraint → 約束 Constraint

保留英文是為了方便對照官方文件、YouTube 教學與工程術語。

## 開發分支

`feat/zh-TW-localization`
