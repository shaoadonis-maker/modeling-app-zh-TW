# GPT 建模助手（桌面版）

此 Zoo 內建外掛使用自己的 OpenAI API 金鑰，透過對話產生目前 KCL 檔案的修改建議。

## 使用方式

1. 安裝包含此功能的 Zoo Windows 版本，建立或開啟 `.kcl` 檔案。
2. 按頂端的「GPT 建模助手」。如未顯示，可到設定的「外掛」啟用。
3. 在「OpenAI 連線設定」輸入自己的 API 金鑰與可使用的模型名稱，按「儲存設定」。預設為 `gpt-5.4`，可改為帳號支援且具備 Responses API、結構化輸出的模型。
4. 輸入具體尺寸與修改需求，例如「將電池盒壁厚改為 2 mm，保留孔位」。
5. 檢視修改前與建議 KCL，按「檢查語法並套用到編輯器」。
6. 在 Zoo 執行／儲存，檢查幾何與尺寸。套用的編輯可使用 Zoo 的復原功能撤回。

## 行為與限制

- 只有按送出時才呼叫 OpenAI。送出目前 KCL 與最近的對話，不讀取其他專案檔案或上傳整個資料夾。
- API 費用由自己的 OpenAI 帳號計算；此外掛不使用 Zoo Zookeeper 額度。
- 金鑰由 Electron 主程序使用系統加密服務保存於本機使用者資料目錄的 `openai-assistant.enc`，不寫進專案或一般設定；介面不會讀回已儲存的金鑰。
- API 使用 `store: false`。此選項不代表完全離線，也不等同於零資料保留協議。
- 對話與建議只保留在開啟的助手中；關閉助手或切換檔案會清除並取消進行中的請求。
- 語法檢查成功不代表幾何有效。套用不自動執行或儲存，須在 Zoo 中確認結果。
- 若目前檔案已被編輯、切換或正在執行，會阻止套用過期建議。
- 目前支援單一 KCL 檔案，不直接重寫 STEP 二進位模型，也不會自動修改匯入的其他 KCL 檔案。
- 沒有 API 金鑰時仍可安裝與設定；真實模型輸出品質需要使用者金鑰與代表性模型進行驗證。

## 開發驗證

`node node_modules/vitest/vitest.mjs run --mode=development --project=unit src/registry/plugins/openaiAssistant`

測試使用模擬 API，不產生 API 費用。測試範圍包含完整／拒絕／截斷回覆、固定端點、取消、過期修改與介面套用。

API 參考：[Responses 與結構化輸出](https://developers.openai.com/api/docs/guides/structured-outputs)、[GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4)。
