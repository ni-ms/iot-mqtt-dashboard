import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CardModel } from "./CardModel"

export const DashboardStoreModel = types
    .model("DashboardStore")
    .props({
        cards: types.array(CardModel),
    })
    .actions(withSetPropAction)
    .actions((self) => ({
        addCard(card: SnapshotIn<typeof CardModel>) {
            self.cards.push(card)
        },
        removeCard(id: string) {
            const idx = self.cards.findIndex(c => c.id === id)
            if (idx > -1) self.cards.splice(idx, 1)
        },
        updateCard(id: string, updates: Partial<SnapshotIn<typeof CardModel>>) {
            const card = self.cards.find(c => c.id === id)
            if (card) {
                Object.assign(card, updates)
            }
        }
    }))
    .views((self) => ({
        get activeTopics() {
            const topics = new Set<string>()
            self.cards.forEach(c => topics.add(c.topic))
            return Array.from(topics)
        }
    }))

export interface DashboardStore extends Instance<typeof DashboardStoreModel> { }
export interface DashboardStoreSnapshotOut extends SnapshotOut<typeof DashboardStoreModel> { }
export interface DashboardStoreSnapshotIn extends SnapshotIn<typeof DashboardStoreModel> { }
export const createDashboardStoreDefaultModel = () => types.optional(DashboardStoreModel, {})
