import { IStateTreeNode, SnapshotIn, getSnapshot, getType } from "mobx-state-tree"

export const withSetPropAction = (mstInstance: any) => ({
    setProp<K extends keyof SnapshotIn<typeof mstInstance>>(prop: K, value: SnapshotIn<typeof mstInstance>[K]) {
        mstInstance[prop] = value
    },
})
