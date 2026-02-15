import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, ScrollView } from "react-native"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { useStores } from "../models/helpers/RootStoreContext"
import { DataCard } from "../components/DataCard"
import { useHeader } from "../utils/useHeader"
import { DrawerAppScreenProps } from "../navigators"
import { spacing } from "../theme"

interface LayoutSettingsScreenProps extends DrawerAppScreenProps<"LayoutSettings"> { }

export const LayoutSettingsScreen: FC<LayoutSettingsScreenProps> = observer(function LayoutSettingsScreen(_props) {
    const { navigation } = _props
    const { dashboardStore } = useStores()

    useHeader({
        title: "Widget Layout",
        leftIcon: "menu",
        onLeftPress: () => navigation.toggleDrawer(),
        rightIcon: "x",
        onRightPress: () => navigation.navigate("Dashboard"),
    }, [navigation])

    return (
        <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
            <View style={$header}>
                <Text text="Resize and reorder your widgets below. Changes are saved automatically." size="sm" />
            </View>
            <ScrollView contentContainerStyle={$listContent}>
                <View style={$grid}>
                    {dashboardStore.cards.map((item) => (
                        <DataCard
                            key={item.id}
                            card={item}
                            isEditMode={true}
                            onPress={() => navigation.navigate("CardEdit", { cardId: item.id })}
                        />
                    ))}
                </View>
            </ScrollView>
        </Screen>
    )
})

const $root: ViewStyle = {
    flex: 1,
}

const $header: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
}

const $listContent: ViewStyle = {
    padding: spacing.md,
}

const $grid: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
}
