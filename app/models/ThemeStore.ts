import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const ThemeStoreModel = types
    .model("ThemeStore")
    .props({
        cardBgColor: types.maybe(types.string),
        primaryTextColor: types.maybe(types.string),
        dimTextColor: types.maybe(types.string),
        accentColor: types.maybe(types.string),
    })
    .actions(withSetPropAction)
    .actions((self) => ({
        reset() {
            self.cardBgColor = undefined
            self.primaryTextColor = undefined
            self.dimTextColor = undefined
            self.accentColor = undefined
        },
    }))

export interface ThemeStore extends Instance<typeof ThemeStoreModel> { }
export interface ThemeStoreSnapshotOut extends SnapshotOut<typeof ThemeStoreModel> { }
export interface ThemeStoreSnapshotIn extends SnapshotIn<typeof ThemeStoreModel> { }
