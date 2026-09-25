import { defineRegistryItem, provide } from '@kittycad/registry'
import { appHeaderItemsValueSpec } from '@src/registry/contracts/appHeader'
import { createZdsPlugin } from '@src/registry/createZdsPlugin'
import { AssistantButton } from '@src/registry/plugins/openaiAssistant/AssistantButton'
import { OPENAI_PLUGIN_ID } from '@src/registry/plugins/openaiAssistant/shared'

export default createZdsPlugin({
  id: OPENAI_PLUGIN_ID,
  title: 'GPT 建模助手',
  description: '使用自己的 OpenAI API 金鑰，以對話產生及修改 KCL 模型。',
  defaultSetting: 'core',
  activationSetting: {
    category: 'plugins',
    settingName: OPENAI_PLUGIN_ID,
    title: 'GPT 建模助手',
    description: '在桌面版啟用 GPT 對話與模型修改預覽。',
    hideOnLevel: 'project',
    hideOnPlatform: 'web',
    userToml: { sectionKey: 'plugins', tomlKey: OPENAI_PLUGIN_ID },
  },
  items: [
    defineRegistryItem({
      provides: [
        provide(appHeaderItemsValueSpec, {
          id: 'openai-assistant.open',
          order: 8,
          Component: AssistantButton,
        }),
      ],
    }),
  ],
})
