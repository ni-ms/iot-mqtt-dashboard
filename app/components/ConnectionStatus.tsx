import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "./Text"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "../theme"
import { useStores } from "../models/helpers/RootStoreContext"

export const ConnectionStatus = observer(function ConnectionStatus() {
    const { mqttStore } = useStores()
    const status = mqttStore.status

    const color = status === "connected" ? colors.palette.secondary500 :
        status === "connecting" ? colors.palette.primary300 :
            colors.error

    return (
        <View style={[$container, { backgroundColor: color }]}>
            <Text text={`MQTT: ${status.toUpperCase()}`} style={{ color: "white", fontSize: 12, fontWeight: "bold" }} />
        </View>
    )
})

const $container: ViewStyle = {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
    alignSelf: "flex-start",
}
