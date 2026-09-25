import { localizeUiText } from '@src/i18n/uiLabels'
import { getLocale } from '@src/i18n'
import type { MachineManager } from '@src/lib/MachineManager'
import { MAKE_TOAST_MESSAGES } from '@src/lib/constants'
import type { components } from '@src/lib/machine-api'
import type ModelingAppFile from '@src/lib/modelingAppFile'
import toast from 'react-hot-toast'

// Make files locally from an export call.
export async function exportMake({
  files,
  name,
  toastId,
  machineManager,
}: {
  files: ModelingAppFile[]
  name: string
  toastId: string
  machineManager: MachineManager
}): Promise<Response | null> {
  if (name === '') {
    console.error(MAKE_TOAST_MESSAGES.NO_NAME)
    toast.error(localizeUiText(MAKE_TOAST_MESSAGES.NO_NAME, getLocale()), {
      id: toastId,
    })
    return null
  }

  if (machineManager.machines.length === 0) {
    console.error(MAKE_TOAST_MESSAGES.NO_MACHINES)
    toast.error(localizeUiText(MAKE_TOAST_MESSAGES.NO_MACHINES, getLocale()), {
      id: toastId,
    })
    return null
  }

  const machineApiIp = machineManager.machineApiIp
  if (!machineApiIp) {
    console.error(MAKE_TOAST_MESSAGES.NO_MACHINE_API_IP)
    toast.error(
      localizeUiText(MAKE_TOAST_MESSAGES.NO_MACHINE_API_IP, getLocale()),
      { id: toastId }
    )
    return null
  }

  const currentMachine = machineManager.currentMachine
  if (!currentMachine) {
    console.error(MAKE_TOAST_MESSAGES.NO_CURRENT_MACHINE)
    toast.error(
      localizeUiText(MAKE_TOAST_MESSAGES.NO_CURRENT_MACHINE, getLocale()),
      { id: toastId }
    )
    return null
  }

  let machineId = currentMachine?.id
  if (!machineId) {
    console.error(MAKE_TOAST_MESSAGES.NO_MACHINE_ID, currentMachine)
    toast.error(
      localizeUiText(MAKE_TOAST_MESSAGES.NO_MACHINE_ID, getLocale()),
      { id: toastId }
    )
    return null
  }

  const params: components['schemas']['PrintParameters'] = {
    machine_id: machineId,
    job_name: name,
  }
  try {
    const formData = new FormData()
    formData.append('params', JSON.stringify(params))
    let file = files[0]
    const fileBlob = new Blob([new Uint8Array(file.contents)], {
      type: 'text/plain',
    })
    formData.append('file', fileBlob, file.name)
    console.log('formData', formData)

    const response = await fetch('http://' + machineApiIp + '/print', {
      mode: 'no-cors',
      method: 'POST',
      body: formData,
    })

    console.log('response', response)

    if (!response.ok) {
      console.error(MAKE_TOAST_MESSAGES.ERROR_STARTING_PRINT, response)
      const text = await response.text()
      toast.error(
        localizeUiText('Error while starting print: ', getLocale()) +
          response.statusText +
          ' ' +
          text,
        {
          id: toastId,
        }
      )
      return null
    }

    toast.success(localizeUiText(MAKE_TOAST_MESSAGES.SUCCESS, getLocale()), {
      id: toastId,
    })
    return response
  } catch (error) {
    console.error(MAKE_TOAST_MESSAGES.ERROR_STARTING_PRINT, error)
    toast.error(
      localizeUiText(MAKE_TOAST_MESSAGES.ERROR_STARTING_PRINT, getLocale()),
      { id: toastId }
    )
    return null
  }
}
