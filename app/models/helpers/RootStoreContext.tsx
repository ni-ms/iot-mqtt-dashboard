import { createContext, useContext, useEffect, useState } from "react"
import { RootStore, RootStoreModel } from "../RootStore"
import { setupRootStore } from "./setupRootStore"

const RootStoreContext = createContext<RootStore | undefined>(undefined)

export function useStores() {
    const context = useContext(RootStoreContext)
    if (context === undefined) {
        throw new Error("useStores must be used within RootStoreProvider")
    }
    return context
}

export const RootStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined)

    useEffect(() => {
        ; (async () => {
            const { rootStore: store } = await setupRootStore(RootStoreModel)
            setRootStore(store)
        })()
    }, [])

    if (!rootStore) return null

    return <RootStoreContext.Provider value={rootStore}>{children}</RootStoreContext.Provider>
}
