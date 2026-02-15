import { Instance, SnapshotIn, SnapshotOut, types, flow, getRoot } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import mqtt from "mqtt"

export const MqttStoreModel = types
    .model("MqttStore")
    .props({
        brokerUrl: types.optional(types.string, "wss://broker.hivemq.com:8000/mqtt"),
        username: types.optional(types.string, ""),
        password: types.optional(types.string, ""),
        status: types.optional(types.enumeration(["connected", "disconnected", "connecting"]), "disconnected"),
    })
    .volatile(() => ({
        client: null as mqtt.MqttClient | null,
    }))
    .actions(withSetPropAction)
    .actions((self) => ({
        setStatus(status: "connected" | "disconnected" | "connecting") {
            self.status = status
        },
    }))
    .actions((self) => ({
        subscribe(topic: string) {
            if (self.client && self.status === 'connected') {
                self.client.subscribe(topic, (err) => {
                    if (err) console.log("Sub error", err)
                })
            }
        },
        unsubscribe(topic: string) {
            if (self.client) {
                self.client.unsubscribe(topic)
            }
        },
        publish(topic: string, message: string) {
            if (self.client && self.status === 'connected') {
                self.client.publish(topic, message)
            }
        },
    }))
    .actions((self) => ({
        connect: flow(function* connect() {
            if (self.status === "connected" || self.status === "connecting") return

            self.setStatus("connecting")
            console.log("MQTT: Attempting connection to", self.brokerUrl)

            try {
                let protocol: any = undefined;
                if (self.brokerUrl.startsWith("wss://")) protocol = "wss";
                else if (self.brokerUrl.startsWith("ws://")) protocol = "ws";

                const options: mqtt.IClientOptions = {
                    username: self.username || undefined,
                    password: self.password || undefined,
                    clientId: `rn-app-${Math.random().toString(16).substr(2, 8)}`,
                    connectTimeout: 10000,
                    reconnectPeriod: 3000,
                    clean: true,
                };

                if (protocol) {
                    options.protocol = protocol;
                }

                const client = mqtt.connect(self.brokerUrl, options)

                client.on("connect", () => {
                    console.log("MQTT: Connected successfully")
                    self.setStatus("connected")

                    const root = getRoot(self) as any
                    if (root.dashboardStore && root.dashboardStore.activeTopics) {
                        const topics = root.dashboardStore.activeTopics
                        console.log("MQTT: Auto-subscribing to dashboard topics:", topics)
                        topics.forEach((topic: string) => {
                            self.subscribe(topic)
                        })
                    }
                })

                client.on("message", (topic, message) => {
                    try {
                        let payload;
                        try {
                            payload = JSON.parse(message.toString())
                        } catch {
                            payload = message.toString()
                        }
                        const root = getRoot(self) as any
                        if (root.processMessage) {
                            root.processMessage(topic, payload)
                        }
                    } catch (e) {
                        console.warn("MQTT: Error processing message", e)
                    }
                })

                client.on("error", (err) => {
                    console.error("MQTT: Connection error:", err.message || err)
                    self.setStatus("disconnected")
                    client.end()
                })

                client.on("close", () => {
                    self.setStatus("disconnected")
                })

                self.client = client
            } catch (e: any) {
                console.error("MQTT: Connection setup failed", e.message || e)
                self.setStatus("disconnected")
            }
        }),
        disconnect() {
            if (self.client) {
                self.client.end(true)
                self.client = null
            }
            self.setStatus("disconnected")
        },
    }))

export interface MqttStore extends Instance<typeof MqttStoreModel> { }
export interface MqttStoreSnapshotOut extends SnapshotOut<typeof MqttStoreModel> { }
export interface MqttStoreSnapshotIn extends SnapshotIn<typeof MqttStoreModel> { }
export const createMqttStoreDefaultModel = () => types.optional(MqttStoreModel, {})
