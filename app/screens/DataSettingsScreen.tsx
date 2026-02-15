import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, Alert } from "react-native"
import * as Clipboard from "expo-clipboard"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { Button } from "../components/Button"
import { useStores } from "../models/helpers/RootStoreContext"
import { useHeader } from "../utils/useHeader"
import { DrawerAppScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface DataSettingsScreenProps extends DrawerAppScreenProps<"DataSettings"> { }

export const DataSettingsScreen: FC<DataSettingsScreenProps> = observer(function DataSettingsScreen(_props) {
    const { dashboardStore } = useStores()
    const { navigation } = _props

    useHeader({
        title: "Backup & Data",
        leftIcon: "menu",
        onLeftPress: () => navigation.toggleDrawer(),
        rightIcon: "x",
        onRightPress: () => navigation.navigate("Dashboard"),
    }, [navigation])

    const handleExport = async () => {
        const config = { cards: dashboardStore.cards }
        await Clipboard.setStringAsync(JSON.stringify(config, null, 2))
        Alert.alert("Config Exported", "Configuration copied to clipboard!")
    }

    const handleExportToFile = async () => {
        if (!Sharing.isAvailableAsync()) {
            Alert.alert("Error", "Sharing is not available")
            return
        }
        const config = { cards: dashboardStore.cards }
        const json = JSON.stringify(config, null, 2)
        // @ts-ignore - Expo types might be missing documentDirectory on some platforms in dev
        const fileUri = (FileSystem.documentDirectory || FileSystem.cacheDirectory) + "dashboard_config.json"
        try {
            await FileSystem.writeAsStringAsync(fileUri, json)
            await Sharing.shareAsync(fileUri)
        } catch (e) {
            Alert.alert("Export Failed", "Could not save or share config file.")
        }
    }

    const handleImport = async () => {
        const content = await Clipboard.getStringAsync()
        try {
            const config = JSON.parse(content)
            if (config.cards && Array.isArray(config.cards)) {
                dashboardStore.setProp("cards", config.cards)
                Alert.alert("Config Imported", `Imported ${config.cards.length} cards.`)
            }
        } catch (e) {
            Alert.alert("Import Failed", "Check your clipboard content.")
        }
    }

    return (
        <Screen style={$root} preset="scroll">
            <View style={$content}>
                <Text text="Configuration Management" preset="subheading" style={$sectionTitle} />
                <Button text="Export to Clipboard" onPress={handleExport} preset="reversed" style={$btn} />
                <Button text="Export to JSON File" onPress={handleExportToFile} preset="reversed" style={$btn} />
                <Button text="Import from Clipboard" onPress={handleImport} preset="reversed" style={$btn} />

                <View style={{ marginTop: spacing.xl }}>
                    <Button
                        text="Wipe All Cards"
                        onPress={() => {
                            Alert.alert("Confirm", "Delete all dashboard cards?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => dashboardStore.setProp("cards", []) }
                            ])
                        }}
                        preset="default"
                        style={{ borderColor: colors.error }}
                    />
                </View>
            </View>
        </Screen>
    )
})

const $root: ViewStyle = { flex: 1 }
const $content: ViewStyle = { padding: spacing.md }
const $sectionTitle: TextStyle = { marginBottom: spacing.md, color: colors.palette.neutral500 }
const $btn: ViewStyle = { marginBottom: spacing.md }
