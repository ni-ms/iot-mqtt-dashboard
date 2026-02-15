import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, ScrollView } from "react-native"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { useStores } from "../models/helpers/RootStoreContext"
import { useAppTheme } from "../theme/context"
import { useHeader } from "../utils/useHeader"
import { DrawerAppScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface ThemeSettingsScreenProps extends DrawerAppScreenProps<"ThemeSettings"> { }

export const ThemeSettingsScreen: FC<ThemeSettingsScreenProps> = observer(function ThemeSettingsScreen(_props) {
    const { themeStore } = useStores()
    const { navigation } = _props
    const { setThemeContextOverride, themeContext } = useAppTheme()

    useHeader({
        title: "Theme & Styles",
        leftIcon: "menu",
        onLeftPress: () => navigation.toggleDrawer(),
        rightIcon: "x",
        onRightPress: () => navigation.navigate("Dashboard"),
    }, [navigation])

    const toggleTheme = () => {
        setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
    }

    const PaletteItem = ({ label, prop }: { label: string, prop: keyof typeof themeStore }) => (
        <View style={$paletteItem}>
            <Text text={label} style={$fieldLabel} />
            <View style={$row}>
                <TextField
                    value={themeStore[prop] as string || ""}
                    onChangeText={(v) => themeStore.setProp(prop as any, v)}
                    placeholder="#HEX"
                    containerStyle={{ flex: 1, marginRight: spacing.sm }}
                />
                <View style={[$colorPreview, { backgroundColor: (themeStore[prop] as string) || "#00000000" }]} />
            </View>
        </View>
    )

    return (
        <Screen style={$root} preset="scroll">
            <View style={$content}>
                <Text text="General Theme" preset="subheading" style={$sectionTitle} />
                <Button
                    text={`Current Mode: ${themeContext.toUpperCase()}`}
                    onPress={toggleTheme}
                    preset="reversed"
                    style={{ marginBottom: spacing.xl }}
                />

                <Text text="Element Color Overrides" preset="subheading" style={$sectionTitle} />
                <PaletteItem label="Card Background" prop="cardBgColor" />
                <PaletteItem label="Primary Text" prop="primaryTextColor" />
                <PaletteItem label="Dim Text (Topics/Units)" prop="dimTextColor" />
                <PaletteItem label="Accent (Values/Graphs)" prop="accentColor" />

                <Text text="Presets" preset="subheading" style={$sectionTitle} />
                <View style={$row}>
                    <Button
                        text="Cyberpunk"
                        onPress={() => {
                            themeStore.setProp("cardBgColor", "#1a1a1a")
                            themeStore.setProp("primaryTextColor", "#00ff00")
                            themeStore.setProp("accentColor", "#ff00ff")
                        }}
                        style={{ flex: 1, marginRight: spacing.xs }}
                        preset="default"
                    />
                    <Button
                        text="Reset"
                        onPress={() => themeStore.reset()}
                        style={{ flex: 1 }}
                        preset="default"
                    />
                </View>
            </View>
        </Screen>
    )
})

const $root: ViewStyle = { flex: 1 }
const $content: ViewStyle = { padding: spacing.md }
const $sectionTitle: TextStyle = { marginBottom: spacing.md, color: colors.palette.neutral500, marginTop: spacing.md }
const $paletteItem: ViewStyle = { marginBottom: spacing.md }
const $fieldLabel: TextStyle = { marginBottom: spacing.xs, fontSize: 13 }
const $row: ViewStyle = { flexDirection: 'row', alignItems: 'center' }
const $colorPreview: ViewStyle = { width: 40, height: 40, borderRadius: 4, borderWidth: 1, borderColor: colors.palette.neutral300 }
