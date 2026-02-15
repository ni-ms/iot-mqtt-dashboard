import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { MqttStoreModel } from "./MqttStore"
import { DashboardStoreModel } from "./DashboardStore"
import { ThemeStoreModel } from "./ThemeStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore")
    .props({
        mqttStore: types.optional(MqttStoreModel, {}),
        dashboardStore: types.optional(DashboardStoreModel, {}),
        themeStore: types.optional(ThemeStoreModel, {}),
        error: types.maybeNull(types.string),
        errorCode: types.maybeNull(types.string),
    })
    .actions((self) => ({
        setError(message: string, code?: string) {
            self.error = message
            self.errorCode = code || null
        },
        clearError() {
            self.error = null
            self.errorCode = null
        },
        processMessage(topic: string, payload: any) {
            // Find all cards listening to this topic
            const relevantCards = self.dashboardStore.cards.filter(card => card.topic === topic)
            relevantCards.forEach(card => card.updateFromPayload(payload))
        }
    }))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> { }
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> { }
