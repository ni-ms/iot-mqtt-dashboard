import { IAnyModelType, onSnapshot } from "mobx-state-tree"
import * as storage from "../../utils/storage"

const ROOT_STATE_STORAGE_KEY = "root-v1"

export async function setupRootStore(rootStoreModel: IAnyModelType) {
    let rootStore: any
    let data: any

    try {
        data = (await storage.load(ROOT_STATE_STORAGE_KEY)) || {}
    } catch (e) {
        data = {}
    }

    // Handle potential schema changes or empty data
    if (!data) data = {}

    try {
        rootStore = rootStoreModel.create(data)
    } catch (e) {
        rootStore = rootStoreModel.create({})
    }

    // track changes & save to storage
    onSnapshot(rootStore, (snapshot) => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))

    return { rootStore }
}
