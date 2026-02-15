// TypeScript
import AsyncStorage from "@react-native-async-storage/async-storage"
import { z } from "zod"

import { AppSettings, makeDefaultSettings, WidgetType } from "../../app/types/settings"

const SETTINGS_KEY = "app.settings.v1"

// A tiny validator to keep data clean
const WidgetSchema = z.object({
  id: z.string(),
  topic: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
  type: z.custom<WidgetType>((val) => ["numeric", "text", "boolean"].includes(String(val))),
  precision: z.number().int().nonnegative().optional(),
})

const SettingsSchema = z.object({
  mqtt: z.object({
    url: z.string(),
    clientId: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    topics: z.array(WidgetSchema),
  }),
  ui: z.object({
    gridColumns: z.number().int().min(1).max(4),
    staleMs: z.number().int().min(1_000),
  }),
})

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY)
    if (!raw) return makeDefaultSettings()
    const parsed = JSON.parse(raw)
    const safe = SettingsSchema.safeParse(parsed)
    return safe.success ? (safe.data as AppSettings) : makeDefaultSettings()
  } catch {
    return makeDefaultSettings()
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export async function resetSettings(): Promise<AppSettings> {
  const defaults = makeDefaultSettings()
  await saveSettings(defaults)
  return defaults
}
