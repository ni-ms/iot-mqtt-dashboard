// TypeScript
// eslint-disable-next-line no-restricted-imports
import React, { createContext, useContext } from "react"

import { useMqtt } from "./useMqtt"
import { useSettings } from "../settings/SettingsProvider"

type Ctx = ReturnType<typeof useMqtt>

const MqttContext = createContext<Ctx | undefined>(undefined)

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const { settings, ready } = useSettings()
  const mqtt = useMqtt(settings)

  // Avoid rendering children until settings are loaded (prevents a connect flicker)
  if (!ready) return null

  return <MqttContext.Provider value={mqtt}>{children}</MqttContext.Provider>
}

export function useMqttContext() {
  const ctx = useContext(MqttContext)
  if (!ctx) throw new Error("useMqttContext must be used inside MqttProvider")
  return ctx
}
