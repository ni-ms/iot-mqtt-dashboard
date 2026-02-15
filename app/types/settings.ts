// TypeScript
export type WidgetType = "numeric" | "text" | "boolean"

export interface TopicWidget {
  id: string
  topic: string
  label: string
  unit?: string
  type: WidgetType
  precision?: number
}

export interface MqttSettings {
  url: string
  clientId?: string
  username?: string
  password?: string
  topics: TopicWidget[]
}

export interface UiSettings {
  gridColumns: number
  staleMs: number // consider a value stale after this many ms without updates
}

export interface AppSettings {
  mqtt: MqttSettings
  ui: UiSettings
}

export function makeDefaultSettings(): AppSettings {
  const rand = Math.random().toString(36).slice(2, 8)
  return {
    mqtt: {
      url: "", // set in Settings
      clientId: `app-${rand}`,
      username: "",
      password: "",
      topics: [], // managed in Settings
    },
    ui: {
      gridColumns: 2,
      staleMs: 30_000,
    },
  }
}
