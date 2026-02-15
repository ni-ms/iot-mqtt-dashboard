// TypeScript
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { AppSettings, makeDefaultSettings } from "../../types/settings"
import { loadSettings, saveSettings, resetSettings } from "../settingsStorage"

type Ctx = {
  ready: boolean
  settings: AppSettings
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => Promise<void>
  setSettings: (next: AppSettings) => Promise<void>
  reset: () => Promise<void>
}

const SettingsContext = createContext<Ctx | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [settings, setSettingsState] = useState<AppSettings>(makeDefaultSettings())

  useEffect(() => {
    let mounted = true
    loadSettings().then((s) => {
      if (!mounted) return
      setSettingsState(s)
      setReady(true)
    })
    return () => {
      mounted = false
    }
  }, [])

  const setSettings = useCallback(async (next: AppSettings) => {
    setSettingsState(next)
    await saveSettings(next)
  }, [])

  const updateSettings = useCallback(async (updater: (prev: AppSettings) => AppSettings) => {
    setSettingsState((prev) => {
      const next = updater(prev)
      saveSettings(next)
      return next
    })
  }, [])

  const reset = useCallback(async () => {
    const defaults = await resetSettings()
    setSettingsState(defaults)
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      ready,
      settings,
      updateSettings,
      setSettings,
      reset,
    }),
    [ready, settings, updateSettings, setSettings, reset],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider")
  return ctx
}
