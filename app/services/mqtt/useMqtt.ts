// TypeScript
import { useEffect, useMemo, useRef, useState } from "react"
import mqtt, { MqttClient } from "mqtt"

import type { AppSettings } from "../../types/settings"

export type MqttStatus = "idle" | "connecting" | "connected" | "reconnecting" | "error" | "stopped"

export type TopicValue = {
  value: string | number | boolean | unknown
  receivedAt: number
  topic: string
}

export type ValuesMap = Record<string, TopicValue | undefined>

function parsePayload(payload: Uint8Array) {
  const str = new TextDecoder().decode(payload)
  // Try JSON, then number, then boolean-like strings, else raw string
  try {
    const json = JSON.parse(str)
    return json
  } catch { }
  const num = Number(str)
  if (!Number.isNaN(num)) return num
  if (str.toLowerCase() === "true") return true
  if (str.toLowerCase() === "false") return false
  return str
}

export function useMqtt(settings: AppSettings) {
  const clientRef = useRef<MqttClient | null>(null)
  const [status, setStatus] = useState<MqttStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<ValuesMap>({})

  const topics = useMemo(() => settings.mqtt.topics.map((t) => t.topic), [settings.mqtt.topics])

  useEffect(() => {
    // If no URL, ensure we're stopped
    if (!settings.mqtt.url) {
      setStatus("stopped")
      if (clientRef.current) {
        clientRef.current.end(true)
        clientRef.current = null
      }
      return
    }

    setStatus("connecting")
    setError(null)

    const clientId = settings.mqtt.clientId || `app-${Math.random().toString(36).slice(2, 8)}`
    const client = mqtt.connect(settings.mqtt.url, {
      clientId,
      protocol: settings.mqtt.url.startsWith("wss") ? "wss" : "ws",
      username: settings.mqtt.username || undefined,
      password: settings.mqtt.password || undefined,
      reconnectPeriod: 3_000,
      clean: true,
    })

    clientRef.current = client

    client.on("connect", () => {
      setStatus("connected")
      // (Re)subscribe to all configured topics
      if (topics.length > 0) client.subscribe(topics, (err: any) => err && setError(String(err)))
    })

    client.on("reconnect", () => setStatus("reconnecting"))
    client.on("error", (e: any) => setError(String(e)))
    client.on("close", () => {
      // keep state; status will flip on reconnecting or stop on cleanup
    })

    client.on("message", (topic: any, payload: Uint8Array) => {
      const parsed = parsePayload(payload)
      setValues((prev) => ({
        ...prev,
        [topic]: { value: parsed, receivedAt: Date.now(), topic },
      }))
    })

    return () => {
      client.removeAllListeners()
      client.end(true)
      clientRef.current = null
      setStatus("stopped")
    }
    // Reconnect when URL/credentials/topics change
  }, [
    settings.mqtt.url,
    settings.mqtt.username,
    settings.mqtt.password,
    settings.mqtt.clientId,
    topics.join("|"),
  ])

  function publish(topic: string, message: string | Uint8Array) {
    // @ts-ignore - Buffer/Uint8Array compatibility issues in RN environment
    clientRef.current?.publish(topic, typeof message === "string" ? message : Buffer.from(message))
  }

  return { status, error, values, publish }
}
