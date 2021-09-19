import { UploadType } from '../types'

export interface HistoryInfo {
  from: string | null
  to: string
  stayTime: number | null
  uploadType: UploadType
}
