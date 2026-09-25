import { CustomIcon } from '@src/components/CustomIcon'
import { isDesktop } from '@src/lib/isDesktop'
import { useLocale } from '@src/i18n'
import type { PropsWithChildren, ReactNode } from 'react'

/**
 * Local authoring surface for the Zookeeper welcome message.
 *
 * When this content needs to come from a remote source, resolve that content
 * before rendering `ZookeeperConversation` and pass it through the
 * `welcomeMessage` prop. That keeps the conversation layout logic unchanged
 * while swapping the content source.
 */
export const ZookeeperConversationWelcome = () => {
  const locale = useLocale()
  const zh = locale === 'zh-TW'

  return (
    <div data-testid="ml-ephant-conversation-welcome" className="px-4 py-3">
      <div className="bg-img-mel w-16 h-16 rounded mb-4" />
      <h2 className="text-lg font-semibold my-2">
        {zh ? '你好，我是 Zookeeper。' : 'Hello there, I’m Zookeeper.'}
      </h2>
      <p className="text-2 text-sm">
        {zh
          ? '我可以透過逐步、結構化的指令，協助你建立與編輯真正可參數化的 CAD 幾何。'
          : "I'm here to help you create and edit real, parametric CAD geometry through incremental, structured commands."}
      </p>

      <WelcomeItem
        graphic={
          <video
            className="w-16 h-16 object-cover object-center"
            muted
            autoPlay
            loop
          >
            <source src={`${isDesktop() ? '.' : ''}/zookeeper-idle-1.webm`} />
          </video>
        }
        heading={zh ? '任何問題都可以問我' : 'Ask me anything'}
      >
        <p>
          {zh ? '從零件設計到製造建議，我都可以協助。' : 'From designing parts to giving manufacturing feedback, I’m ready to help.'}
        </p>
      </WelcomeItem>
      <WelcomeItem
        graphic={
          <video
            className="w-16 h-16 object-cover object-center"
            muted
            autoPlay
            loop
          >
            <source src={`${isDesktop() ? '.' : ''}/zookeeper-idle-2.webm`} />
          </video>
        }
        heading={zh ? '把想法轉成幾何' : 'Turn thoughts into geometry'}
      >
        <p>
          {zh ? '我會逐步建立特徵，產生結構化且可完整編輯的幾何。' : 'I create structured, fully editable geometry by building features step by step.'}
        </p>
      </WelcomeItem>
      <WelcomeItem
        graphic={
          <video
            className="w-16 h-16 object-cover object-center"
            muted
            autoPlay
            loop
          >
            <source src={`${isDesktop() ? '.' : ''}/zookeeper-idle-3.webm`} />
          </video>
        }
        heading={zh ? '輔助分析' : 'Supplemental analysis'}
      >
        <p>
          {zh ? '除了建立幾何，我也能協助分析質心、體積與表面積等模型衍生屬性。' : 'Beyond geometry creation, I can help you with model-derived properties like center of mass, volume, and surface area.'}
        </p>
      </WelcomeItem>
      <WelcomeItem
        graphic={
          <CustomIcon
            name="paperclip"
            className="w-8 h-8 m-4 text-2 flex-none"
          />
        }
        heading={zh ? '上傳圖片，依照真實參考進行設計' : 'Upload your image to work from real references'}
      >
        <p>
          {zh ? '上傳圖片後，我會理解內容、擷取設計意圖，並逐步協助你設計或改善幾何。' : 'Upload an image and I’ll interpret it, extract intent, and help you design or improve the geometry step by step.'}
        </p>
      </WelcomeItem>
    </div>
  )
}

interface WelcomeItemProps extends PropsWithChildren {
  graphic: ReactNode
  heading: string
}

function WelcomeItem(props: WelcomeItemProps) {
  return (
    <div className="flex gap-4 my-4">
      {props.graphic}
      <div>
        <h2 className="text-2 font-semibold text-sm">{props.heading}</h2>
        <div className="text-3 text-sm">{props.children}</div>
      </div>
    </div>
  )
}
