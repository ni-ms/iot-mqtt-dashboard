import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle } from "react-native"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { useStores } from "../models/helpers/RootStoreContext"
import { useHeader } from "../utils/useHeader"
import { DrawerAppScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { ConnectionStatus } from "../components/ConnectionStatus"

interface MqttSettingsScreenProps extends DrawerAppScreenProps<"MqttSettings"> { }

export const MqttSettingsScreen: FC<MqttSettingsScreenProps> = observer(function MqttSettingsScreen(_props) {
    const { mqttStore } = useStores()
    const { navigation } = _props

    // Local state for fields
    const [brokerUrl, setBrokerUrl] = useState(mqttStore.brokerUrl)
    const [username, setUsername] = useState(mqttStore.username)
    const [password, setPassword] = useState(mqttStore.password)

    const urlMatch = brokerUrl.match(/^(wss?:\/\/)?([^:/]+)(?::(\d+))?(\/.*)?$/)
    const [protocol, setProtocol] = useState(urlMatch?.[1] || "wss://")
    const [host, setHost] = useState(urlMatch?.[2] || "")
    const [port, setPort] = useState(urlMatch?.[3] || "")
    const [path, setPath] = useState(urlMatch?.[4] || "/mqtt")

    useHeader({
        title: "MQTT Config",
        leftIcon: "menu",
        onLeftPress: () => navigation.toggleDrawer(),
        rightIcon: "x",
        onRightPress: () => navigation.navigate("Dashboard"),
    }, [navigation])

    const handleSave = () => {
        const finalUrl = `${protocol}${host}${port ? ":" + port : ""}${path}`
        mqttStore.setProp("brokerUrl", finalUrl)
        mqttStore.setProp("username", username)
        mqttStore.setProp("password", password)
        if (mqttStore.status === 'connected') mqttStore.disconnect()
    }

    const handleConnect = () => {
        handleSave()
        mqttStore.connect()
    }

    return (
        <Screen style={$root} preset="scroll">
            <View style={$content}>
                <Text text="MQTT Broker Connection" preset="subheading" style={$sectionTitle} />

                <Text text="Protocol" style={{ marginBottom: spacing.xs }} />
                <View style={$row}>
                    <Button
                        text="wss://"
                        onPress={() => {
                            setProtocol("wss://")
                            setBrokerUrl(`wss://${host}${port ? ":" + port : ""}${path}`)
                        }}
                        preset={protocol === "wss://" ? "filled" : "default"}
                        style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                        text="ws://"
                        onPress={() => {
                            setProtocol("ws://")
                            setBrokerUrl(`ws://${host}${port ? ":" + port : ""}${path}`)
                        }}
                        preset={protocol === "ws://" ? "filled" : "default"}
                        style={{ flex: 1 }}
                    />
                </View>

                <Button
                    text="Preset: EMQX Cloud"
                    onPress={() => {
                        setProtocol("wss://")
                        setHost("h96911ff.ala.asia-southeast1.emqxsl.com")
                        setPort("8084")
                        setPath("/mqtt")
                        setBrokerUrl("wss://h96911ff.ala.asia-southeast1.emqxsl.com:8084/mqtt")
                    }}
                    preset="reversed"
                    style={{ marginBottom: spacing.md }}
                />

                <TextField
                    label="Host"
                    value={host}
                    onChangeText={(v) => {
                        setHost(v)
                        setBrokerUrl(`${protocol}${v}${port ? ":" + port : ""}${path}`)
                    }}
                    autoCapitalize="none"
                    containerStyle={$field}
                />

                <View style={$row}>
                    <TextField
                        label="Port"
                        value={port}
                        onChangeText={(v) => {
                            setPort(v)
                            setBrokerUrl(`${protocol}${host}${v ? ":" + v : ""}${path}`)
                        }}
                        containerStyle={{ flex: 1, marginRight: spacing.md }}
                    />
                    <TextField
                        label="Path"
                        value={path}
                        onChangeText={(v) => {
                            setPath(v)
                            setBrokerUrl(`${protocol}${host}${port ? ":" + port : ""}${v}`)
                        }}
                        containerStyle={{ flex: 1 }}
                    />
                </View>

                <TextField
                    label="Username (Optional)"
                    value={username}
                    onChangeText={setUsername}
                    containerStyle={$field}
                />

                <TextField
                    label="Password (Optional)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    containerStyle={$field}
                />

                <Button
                    text="Save Settings"
                    onPress={handleSave}
                    preset="filled"
                    style={$saveButton}
                />

                <View style={$statusContainer}>
                    <ConnectionStatus />
                    <Button
                        text={mqttStore.status === 'connected' || mqttStore.status === 'connecting' ? "Disconnect" : "Connect"}
                        preset={mqttStore.status === 'connected' ? "default" : "reversed"}
                        style={{ marginLeft: spacing.sm, flex: 1 }}
                        onPress={() => {
                            if (mqttStore.status === 'connected' || mqttStore.status === 'connecting') {
                                mqttStore.disconnect()
                            } else {
                                handleConnect()
                            }
                        }}
                    />
                </View>
            </View>
        </Screen>
    )
})

const $root: ViewStyle = { flex: 1 }
const $content: ViewStyle = { padding: spacing.md }
const $sectionTitle: TextStyle = { marginBottom: spacing.md, color: colors.palette.neutral500 }
const $field: ViewStyle = { marginBottom: spacing.md }
const $row: ViewStyle = { flexDirection: 'row', marginBottom: spacing.md }
const $saveButton: ViewStyle = { marginTop: spacing.md, marginBottom: spacing.xl }
const $statusContainer: ViewStyle = { flexDirection: "row", alignItems: "center", marginBottom: spacing.xl }
