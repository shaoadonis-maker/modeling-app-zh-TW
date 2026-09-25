import { Spinner } from '@src/components/Spinner'
import { useAbsoluteFilePath } from '@src/hooks/useAbsoluteFilePath'
import { useApp } from '@src/lib/boot'
import { SEARCH_PARAM_ZOOKEEPER_PROMPT_KEY } from '@src/lib/constants'
import { modifiedColdPlate } from '@src/lib/exampleKcl'
import { DefaultLayoutPaneID } from '@src/lib/layout'
import {
  type DesktopOnboardingPath,
  desktopOnboardingPaths,
  legacyDesktopOnboardingPathAliases,
} from '@src/lib/onboardingPaths'
import { openExternalBrowserIfDesktop } from '@src/lib/openWindow'
import { PATHS, joinRouterPaths } from '@src/lib/paths'
import { withSiteBaseURL } from '@src/lib/withBaseURL'
import type { Selections } from '@src/machines/modelingSharedTypes'
import { SystemIOMachineEvents } from '@src/machines/systemIO/utils'
import {
  OnboardingButtons,
  OnboardingCard,
  isModelingCmdGroupReady,
  useAdvanceOnboardingOnFormSubmit,
  useOnModelingCmdGroupReadyOnce,
  useOnboardingHighlight,
  useOnboardingPanes,
} from '@src/routes/Onboarding/utils'
import { useEffect, useState } from 'react'
import { useLocale } from '@src/i18n'
import { type RouteObject, useSearchParams } from 'react-router-dom'

type DesktopOnboardingRoute = RouteObject & {
  path: keyof typeof desktopOnboardingPaths
}

/**
 * This is the mapping between desktop onboarding paths and the components that will be rendered.
 * All components are defined below in this file.
 *
 * Desktop onboarding content is completely separate from browser onboarding content.
 */
const onboardingComponents: Record<DesktopOnboardingPath, React.JSX.Element> = {
  '/desktop': <Welcome />,
  '/desktop/scene': <Scene />,
  '/desktop/toolbar': <Toolbar />,
  '/desktop/zookeeper': <Zookeeper />,
  '/desktop/zookeeper-prompt': <ZookeeperPrompt />,
  '/desktop/text-to-cad': <Zookeeper />,
  '/desktop/text-to-cad-prompt': <ZookeeperPrompt />,
  '/desktop/feature-tree-pane': <FeatureTreePane />,
  '/desktop/code-pane': <CodePane />,
  '/desktop/project-pane': <ProjectPane />,
  '/desktop/other-panes': <OtherPanes />,
  '/desktop/prompt-to-edit': <PromptToEdit />,
  '/desktop/prompt-to-edit-prompt': <PromptToEditPrompt />,
  '/desktop/prompt-to-edit-result': <PromptToEditResult />,
  '/desktop/imports': <Imports />,
  '/desktop/exports': <Exports />,
  '/desktop/conclusion': <OnboardingConclusion />,
}

function useOnboardingProjectIO() {
  const { project, systemIOActor } = useApp()
  return { projectName: project?.name, systemIOActor }
}

function Welcome() {
  const locale = useLocale()
  const { projectName, systemIOActor } = useOnboardingProjectIO()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop'

  // Ensure panes are closed
  useOnboardingPanes()

  // Things that happen when we load this route
  useEffect(() => {
    if (!projectName) {
      return
    }
    // Navigate to the `main.kcl` file
    systemIOActor.send({
      type: SystemIOMachineEvents.navigateToFile,
      data: {
        requestedProjectName: projectName,
        requestedFileName: 'main.kcl',
        requestedSubRoute: joinRouterPaths(
          String(PATHS.ONBOARDING),
          thisOnboardingStatus
        ),
      },
    })
  }, [systemIOActor, projectName])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 grid items-end justify-center p-2">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '歡迎使用 Zoo Design Studio' : 'Welcome to Zoo Design Studio'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '這是一個使用 Zoo Design Studio 製作的冷板模型。'
            : 'Here is a cold plate that was made in Zoo Design Studio.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '接下來會帶你快速了解基本操作，以及如何使用各種工具建立設計。'
            : 'Let’s walk through the basics of how to get started, and how you can use several tools at your disposal to create great designs.'}
        </p>
        <OnboardingButtons currentSlug="/desktop" platform="desktop" />
      </OnboardingCard>
    </div>
  )
}

function Scene() {
  const locale = useLocale()
  const { projectName, systemIOActor } = useOnboardingProjectIO()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/scene'
  const currentFilePath = useAbsoluteFilePath()
  const isBlankFileOpen = Boolean(currentFilePath?.endsWith('blank.kcl'))
  const [isBlankSceneReady, setIsBlankSceneReady] = useState(isBlankFileOpen)

  // Ensure panes are closed
  useOnboardingPanes()

  useEffect(() => {
    if (isBlankFileOpen) {
      setIsBlankSceneReady(true)
    }
  }, [isBlankFileOpen])

  // Things that happen when we load this route
  useEffect(() => {
    if (!projectName) {
      return
    }
    if (isBlankFileOpen) {
      return
    }
    let cancelled = false
    setIsBlankSceneReady(false)
    // Create if necessary and navigate to the `blank.kcl` file
    systemIOActor.send({
      type: SystemIOMachineEvents.bulkCreateKCLFilesAndNavigateToFile,
      data: {
        requestedProjectName: projectName,
        requestedFileNameWithExtension: 'blank.kcl',
        files: [
          {
            requestedProjectName: projectName,
            requestedFileName: 'blank.kcl',
            requestedCode: '',
          },
        ],
        override: true,
        requestedSubRoute: joinRouterPaths(
          String(PATHS.ONBOARDING),
          thisOnboardingStatus
        ),
        onSuccess: () => {
          if (!cancelled) {
            setIsBlankSceneReady(true)
          }
        },
      },
    })
    return () => {
      cancelled = true
    }
  }, [systemIOActor, projectName, isBlankFileOpen])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid items-end justify-center p-2">
      <OnboardingCard className="pointer-events-auto">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '場景 Scene' : 'Scene'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '這是一個空白場景。場景為空時會顯示三個預設基準面。你可以按住滑鼠右鍵拖曳來旋轉視角，並使用滾輪縮放。'
            : 'Here is a blank scene. There are three default planes shown when the scene is empty. Try right-clicking and dragging to orbit around, and scroll to zoom in and out.'}
        </p>
        {!isBlankSceneReady && (
          <p className="my-4 flex items-center gap-2">
            <Spinner className="w-5 h-5" />
            {locale === 'zh-TW' ? '正在準備空白場景…' : 'Preparing blank scene...'}
          </p>
        )}
        <OnboardingButtons
          currentSlug="/desktop/scene"
          hideNext={!isBlankSceneReady}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function Toolbar() {
  const locale = useLocale()
  // Highlight the toolbar if it's present
  useOnboardingHighlight('toolbar')

  // Ensure panes are closed
  useOnboardingPanes()

  return (
    <div className="cursor-not-allowed fixed inset-0 z-[99] grid items-start justify-center p-24">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '這是工具列 Toolbar' : 'This is the toolbar'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '你可以點擊工具列中的工具來執行建模與草圖操作。'
            : 'You can perform modeling and sketching actions by clicking any of the tools.'}
        </p>
        <OnboardingButtons currentSlug="/desktop/toolbar" platform="desktop" />
      </OnboardingCard>
    </div>
  )
}

function Zookeeper() {
  const locale = useLocale()
  // Highlight the zookeeper button if it's present
  useOnboardingHighlight('ttc-pane-button')

  // Ensure panes are closed
  useOnboardingPanes()

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 grid items-start justify-center p-24">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? 'Zookeeper AI' : 'Zookeeper'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '你可以在右側邊欄找到 Zookeeper。輸入你想要的設計描述後，AI 會替你產生 CAD。Zookeeper 目前仍屬實驗功能，我們持續改善中。'
            : 'You can find Zookeeper in the right sidebar. This allows you to write up a description of what you want, and our AI will generate the CAD for you. Zookeeper is currently in an experimental stage. We are improving it every day.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '免費方案每月包含有限次數的 Zookeeper 生成額度。需要更多使用量時可升級付費方案；Pro 與 Team 方案提供更多或無上限的使用權限，實際內容以官方方案為準。'
            : 'Our free plan includes a limited number of Zookeeper generations each month. Upgrade to a paid plan for additional usage. Pro and Team plans come with unlimited Zookeeper generations.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '接下來看一個 Zookeeper 的實際使用範例。'
            : 'Let’s walk through an example of how to use Zookeeper.'}
        </p>
        <OnboardingButtons
          currentSlug="/desktop/zookeeper"
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function ZookeeperPrompt() {
  const locale = useLocale()
  const thisOnboardingStatus: DesktopOnboardingPath =
    '/desktop/zookeeper-prompt'
  const [searchParams, setSearchParams] = useSearchParams()
  const prompt =
    'Design a cold plate with a serpentine copper coolant tube and recessed channels for thermal management'

  // Ensure panes are closed except Zookeeper
  useOnboardingPanes([DefaultLayoutPaneID.Zookeeper])

  // Enter the zookeeper flow with a prebaked prompt
  useEffect(() => {
    searchParams.set(SEARCH_PARAM_ZOOKEEPER_PROMPT_KEY, prompt)
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: blanket-ignored fix me!
  }, [])

  // Make it so submitting the command just advances the onboarding
  useAdvanceOnboardingOnFormSubmit(thisOnboardingStatus, 'desktop')

  return (
    <div className="cursor-not-allowed fixed inset-0 z-[99] grid items-center justify-center">
      <OnboardingCard className="pointer-events-auto">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? 'Zookeeper 提示詞' : 'Zookeeper prompt'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '為了避免消耗你的額度，這個範例會使用預先準備好的 Zookeeper 提示詞。點擊下一步即可查看生成結果範例。'
            : 'To save you money, we are going to use a pre-rolled Zookeeper prompt for this example. Click next to see an example of what Zookeeper can generate.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function FeatureTreePane() {
  const locale = useLocale()
  const { projectName, systemIOActor } = useOnboardingProjectIO()
  const thisOnboardingStatus: DesktopOnboardingPath =
    '/desktop/feature-tree-pane'
  const generatedFileName = 'main.kcl'

  // Highlight the feature tree pane button if it's present
  useOnboardingHighlight('feature-tree-pane-button')

  // Open the feature tree pane on mount, close on unmount
  useOnboardingPanes([DefaultLayoutPaneID.FeatureTree])

  // navigate to the "generated" file
  useEffect(() => {
    if (!projectName) {
      return
    }
    systemIOActor.send({
      type: SystemIOMachineEvents.navigateToFile,
      data: {
        requestedProjectName: projectName,
        requestedFileName: generatedFileName,
        requestedSubRoute: joinRouterPaths(
          String(PATHS.ONBOARDING),
          thisOnboardingStatus
        ),
      },
    })
  }, [systemIOActor, projectName])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-[99] p-8 grid justify-center items-end">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '冷板 Cold Plate' : 'Cold Plate'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '這是使用 Zookeeper 產生的 CAD 模型範例。教學中略過了實際生成步驟。'
            : 'This is an example of the generated CAD model using Zookeeper. We skipped the real generation for this tutorial.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '左側是各種面板，我們已替你開啟特徵樹。特徵樹會顯示建立這個零件時執行的 CAD 操作，你可以雙擊項目來修改參數。'
            : 'To the left are the panes. We have opened the feature tree pane for you. The feature tree pane displays all the CAD functions that were performed to create this part. You can double click feature tree items to edit their parameters.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function CodePane() {
  const locale = useLocale()
  // Highlight the feature tree pane button if it's present
  useOnboardingHighlight('code-pane-button')

  // Open the code pane on mount, close on unmount
  useOnboardingPanes([DefaultLayoutPaneID.Code])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-8 grid justify-center items-end">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? 'KCL 程式碼' : 'KCL Code'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '這是 KCL 面板。KCL（KittyCAD Language）是一種用來描述 CAD 幾何的腳本語言。這份程式碼是模型的主要來源，對模型所做的操作都會反映到程式碼中。'
            : 'This is the KCL Pane. KCL (KittyCAD Language) is a scripting language we created to describe CAD geometries. This code is the source of truth, everything you do to the model will change the code.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? 'KCL 也支援匯入、函式與邏輯等腳本功能。除了從特徵樹編輯幾何外，你也可以直接修改程式碼。'
            : 'KCL boasts other scripting features such as imports, functions and logic. Not only can you edit your geometry from the feature tree, but you can also edit the code directly.'}
        </p>
        <OnboardingButtons
          currentSlug="/desktop/code-pane"
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function ProjectPane() {
  const locale = useLocale()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/project-pane'
  // Highlight the feature tree pane button if it's present
  useOnboardingHighlight('files-pane-button')

  // Open the code pane on mount, close on unmount
  useOnboardingPanes([DefaultLayoutPaneID.Files])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-8 grid justify-center items-end">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '檔案面板 Files Pane' : 'Files Pane'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '接下來是專案檔案面板。你可以在這裡看到專案中的所有檔案，包括其他 KCL 檔，以及 STEP、STL、OBJ 等外部 CAD 檔案。'
            : 'The next pane is the Project Files Pane. Here you can see all of the files you have in this project. This can be other KCL files as well as external CAD files (STEP, STL, OBJ, etc.).'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function OtherPanes() {
  const locale = useLocale()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/other-panes'
  // Highlight the log and variable panes button if it's present
  useOnboardingHighlight('logs-pane-button')
  useOnboardingHighlight('variables-pane-button')

  // Open the panes on mount, close on unmount
  useOnboardingPanes([DefaultLayoutPaneID.Logs, DefaultLayoutPaneID.Variables])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-8 grid justify-center items-end">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '其他面板' : 'Other panes'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '最後這兩個面板是變數面板與記錄面板。變數面板會顯示你建立的參數數值，以及檔案中建立的其他實體與型別；記錄面板則會顯示錯誤與執行記錄。'
            : 'These last two panes are the Variables Pane and Logs Pane. The Variables pane will display the numeric values of any parameters you made, along with other entities and types created in your file. The Logs pane will show error logs.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function PromptToEdit() {
  const locale = useLocale()
  const { projectName, systemIOActor } = useOnboardingProjectIO()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/prompt-to-edit'

  // Highlight the zookeeper button if it's present
  useOnboardingHighlight('ttc-pane-button')

  // Open the zookeeper pane
  // Navigate to the sample file
  useEffect(() => {
    if (!projectName) {
      return
    }
    systemIOActor.send({
      type: SystemIOMachineEvents.navigateToFile,
      data: {
        requestedProjectName: projectName,
        requestedFileName: 'main.kcl',
        requestedSubRoute: joinRouterPaths(
          String(PATHS.ONBOARDING),
          thisOnboardingStatus
        ),
      },
    })
  }, [systemIOActor, projectName])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-8 grid justify-center items-center">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '使用 Zookeeper 修改' : 'Modify with Zookeeper'}</h1>
        <p className="my-4">
          {locale === 'zh-TW' ? (
            <>Zookeeper 不只能<strong>建立</strong>零件，也能<strong>修改</strong>既有零件。你可以在右側的 Zookeeper 面板描述想要的修改內容，AI 會替你產生對應變更。</>
          ) : (
            <>Zookeeper not only can <strong>create</strong> a part, but also <strong>modify</strong> an existing part. Still in the right sidebar, under the “Zookeeper” pane, you’ll be able to describe the change you want for your part, and our AI will generate the change.</>
          )}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function PromptToEditPrompt() {
  const locale = useLocale()
  const { commands } = useApp()
  const thisOnboardingStatus: DesktopOnboardingPath =
    '/desktop/prompt-to-edit-prompt'
  const prompt =
    'Increase the cold plate length to 12 inches and make the copper tube blue.'

  // Open the zookeeper pane
  useOnboardingPanes(
    [DefaultLayoutPaneID.Zookeeper],
    [DefaultLayoutPaneID.Zookeeper]
  )

  // Fill in the prompt if available
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    searchParams.set(SEARCH_PARAM_ZOOKEEPER_PROMPT_KEY, prompt)
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: blanket-ignored fix me!
  }, [])

  // Enter the prompt-to-edit flow with a prebaked prompt
  const [isReady, setIsReady] = useState(
    isModelingCmdGroupReady(commands.actor.getSnapshot())
  )
  useOnModelingCmdGroupReadyOnce(() => {
    setIsReady(true)
    commands.send({
      type: 'Find and select command',
      data: {
        groupId: 'modeling',
        name: 'Prompt-to-edit',
        argDefaultValues: {
          selection: {
            graphSelections: [],
            otherSelections: [],
          } satisfies Selections,
          prompt,
        },
      },
    })
  }, [])

  // Make it so submitting the command just advances the onboarding
  useAdvanceOnboardingOnFormSubmit(thisOnboardingStatus, 'desktop')

  return (
    <div className="cursor-not-allowed fixed inset-0 z-[99] grid items-center justify-center">
      <OnboardingCard className="pointer-events-auto">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '使用 Zookeeper 修改' : 'Modify with Zookeeper'}</h1>
        {!isReady && (
          <p className="absolute top-0 right-0 m-4 w-fit flex items-center py-1 px-2 rounded bg-chalkboard-20 dark:bg-chalkboard-80">
            <Spinner className="w-5 h-5 inline-block mr-2" />
            {locale === 'zh-TW' ? '正在等待連線…' : 'Waiting for connection...'}
          </p>
        )}
        <p className="my-4">
          {locale === 'zh-TW'
            ? '接下來用 Zookeeper 修改既有模型，更新冷板的尺寸與外觀。'
            : 'We are going to use Zookeeper to modify an existing model. Let’s update the cold plate dimensions and appearance.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '為了避免消耗額度，這裡使用預先準備好的 Zookeeper 修改提示詞。你可以在上方看到內容，點擊下一步查看修改結果範例。'
            : 'To save you money, we are using a pre-rolled Zookeeper prompt to edit your existing cold plate. You can see the prompt in the window above. Click next to see an example of what modifying with Zookeeper would look like.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function PromptToEditResult() {
  const locale = useLocale()
  const { projectName, systemIOActor } = useOnboardingProjectIO()
  const thisOnboardingStatus: DesktopOnboardingPath =
    '/desktop/prompt-to-edit-result'

  // Open the code pane on mount, close on unmount
  useOnboardingPanes([DefaultLayoutPaneID.Code])

  useEffect(() => {
    if (!projectName) {
      return
    }
    // Navigate to the `main.kcl` file
    systemIOActor.send({
      type: SystemIOMachineEvents.bulkCreateKCLFilesAndNavigateToProject,
      data: {
        requestedProjectName: projectName,
        files: [
          {
            requestedFileName: 'main.kcl',
            requestedProjectName: projectName,
            requestedCode: modifiedColdPlate,
          },
        ],
        override: true,
        requestedSubRoute: joinRouterPaths(
          String(PATHS.ONBOARDING),
          thisOnboardingStatus
        ),
      },
    })
  }, [systemIOActor, projectName])

  return (
    <div className="cursor-not-allowed fixed inset-0 z-[99] p-8 grid justify-center items-end">
      <OnboardingCard className="col-start-3 col-span-2">
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '結果 Result' : 'Result'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '這是 Zookeeper 可以替你完成的修改範例。教學中略過了實際生成步驟。'
            : 'This is an example of an edit that Zookeeper can make for you. We skipped the real generation for this tutorial.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? 'Zookeeper 可以一起更新具名參數與相關幾何，因此尺寸與外觀的變更仍會與原始模型保持關聯。'
            : 'Zookeeper can update named parameters and related geometry together, so changes to dimensions and appearance stay connected to the source model.'}
        </p>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '目前所有 Zookeeper 功能都仍屬實驗性質。如果遇到問題，歡迎回報並持續關注更新。'
            : 'All of our Zookeeper capabilities are experimental, so please report any issues to us and stay tuned for updates! We are working on it every day.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function Imports() {
  const locale = useLocale()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/imports'

  // Highlight the import and insert buttons if they're present
  useOnboardingHighlight('add-file-to-project-pane-button')
  useOnboardingHighlight('insert')
  // Close the panes on mount, close on unmount
  useOnboardingPanes()

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-24 flex flex-col gap-8 items-center">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '加入檔案到專案' : 'Add file(s) to project'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '左側邊欄提供「加入檔案到專案」功能，可以從範例庫或本機磁碟把檔案加入目前專案。'
            : '"Add file(s) to project" is available in the left sidebar. Use it to bring files into your project, whether from the sample library or from your local drive.'}
        </p>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '匯入零件' : 'Import parts'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '檔案加入專案後，可以使用工具列中的「匯入 Import」把它加入場景。這也是建立組立件的第一步。'
            : 'Once a file has been added to your project, you can add it to the scene using Import. Import is available in the toolbar. This is the first step to making assemblies!'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

function Exports() {
  const locale = useLocale()
  const thisOnboardingStatus: DesktopOnboardingPath = '/desktop/exports'
  // Highlight the export button if it's present
  useOnboardingHighlight('export-pane-button')
  // Close the panes on mount, close on unmount
  useOnboardingPanes()

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-24 grid justify-start items-center">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '匯出 Exporting' : 'Exporting'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '點擊左側邊欄的「匯出 Export」即可匯出目前模型。支援 STEP、glTF、STL、OBJ 等格式。'
            : 'You can export the current model by clicking the Export button in the left sidebar. We support exporting to STEP, gLTF, STL, OBJ, and more.'}
        </p>
        <OnboardingButtons
          currentSlug={thisOnboardingStatus}
          platform="desktop"
          dismissPosition="right"
        />
      </OnboardingCard>
    </div>
  )
}

function OnboardingConclusion() {
  const locale = useLocale()
  // Highlight the App logo
  useOnboardingHighlight('app-logo')
  // Close the panes on mount, close on unmount
  useOnboardingPanes(
    [
      DefaultLayoutPaneID.FeatureTree,
      DefaultLayoutPaneID.Code,
      DefaultLayoutPaneID.Files,
    ],
    [
      DefaultLayoutPaneID.FeatureTree,
      DefaultLayoutPaneID.Code,
      DefaultLayoutPaneID.Files,
    ]
  )

  return (
    <div className="cursor-not-allowed fixed inset-0 z-50 p-24 grid justify-center items-center">
      <OnboardingCard>
        <h1 className="text-xl font-bold">{locale === 'zh-TW' ? '開始建立模型' : 'Time to start building'}</h1>
        <p className="my-4">
          {locale === 'zh-TW'
            ? '基本導覽到這裡完成。點擊「完成」回到首頁，你可以繼續使用教學專案，或建立自己的專案。想了解更深入的技巧，可以前往 '
            : 'We appreciate you taking the time to walk through the basics. Select Finish to return home, where you can keep working with the tutorial project or create a project of your own. To learn more detailed and advanced techniques, '}
          <a
            onClick={openExternalBrowserIfDesktop(withSiteBaseURL('/docs'))}
            href={`${withSiteBaseURL('/docs')}`}
          >
            {locale === 'zh-TW' ? '官方文件' : 'check out our docs'}
          </a>
          {locale === 'zh-TW' ? '。' : '.'}
        </p>
        <OnboardingButtons
          currentSlug="/desktop/conclusion"
          platform="desktop"
        />
      </OnboardingCard>
    </div>
  )
}

export const desktopOnboardingRoutes: DesktopOnboardingRoute[] = [
  ...Object.values(desktopOnboardingPaths).map((path) => ({
    path,
    index: true,
    element: onboardingComponents[path],
  })),
  ...Object.values(legacyDesktopOnboardingPathAliases).map((path) => ({
    path,
    index: true,
    element: onboardingComponents[path],
  })),
]
