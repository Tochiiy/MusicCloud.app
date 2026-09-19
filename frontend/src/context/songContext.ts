import { createContext, useContext } from 'react'
import type { SongContextType } from '../types'

export const SongContext = createContext<SongContextType | undefined>(undefined)

export const useSongContext = () => {
  const context = useContext(SongContext)
  if (!context) {
    throw new Error('useSongContext must be used within a SongProvider')
  }
  return context
}