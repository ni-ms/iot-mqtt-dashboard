import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, FlatList, TextStyle, ScrollView } from "react-native"

import { Screen } from "../components/Screen" // Assuming Screen component exists in Ignite
import { Text } from "../components/Text"
import { Button } from "../components/Button"
import { useStores } from "../models/helpers/RootStoreContext"
import { DataCard } from "../components/DataCard"
import { useHeader } from "../utils/useHeader" // Hook might differ, check if error
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { LayoutAnimation, Platform, UIManager } from "react-native"

if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true)
    }
}

interface DashboardScreenProps extends AppStackScreenProps<"Dashboard"> { }

export const DashboardScreen: FC<DashboardScreenProps> = observer(function DashboardScreen(_props) {
    const { navigation } = _props
    const { dashboardStore, mqttStore } = useStores()

    useHeader({
        title: "MQTT Dashboard",
        rightIcon: "settings",
        onRightPress: () => navigation.navigate("Settings", { screen: "MqttSettings" }),
    }, [navigation])

    // Animate layout changes like adding/removing cards
    React.useEffect(() => {
        if (Platform.OS !== 'android') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    }, [dashboardStore.cards.length]);

    const handleAddCard = () => {
        navigation.navigate("CardEdit", { cardId: undefined })
    }

    const handleEditCard = (cardId: string) => {
        navigation.navigate("CardEdit", { cardId })
    }

    return (
        <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>


            <ScrollView contentContainerStyle={$listContent}>
                <View style={$grid}>
                    {dashboardStore.cards.map((item) => (
                        <DataCard
                            key={item.id}
                            card={item}
                            isEditMode={false}
                            onPress={() => { }}
                        />
                    ))}
                    {dashboardStore.cards.length === 0 && (
                        <View style={$emptyState}>
                            <Text text="No cards yet. Add one!" style={$emptyText} />
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={$fabContainer}>
                <Button text="+ Add Card" onPress={handleAddCard} preset="filled" />
            </View>
        </Screen>
    )
})

const $root: ViewStyle = {
    flex: 1,
}



const $listContent: ViewStyle = {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 40, // Add more padding to avoid FAB overlap
}

const $emptyState: ViewStyle = {
    marginTop: spacing.xl,
    alignItems: "center",
}

const $emptyText: TextStyle = {
    color: colors.textDim,
}

const $fabContainer: ViewStyle = {
    position: "absolute",
    bottom: spacing.xl,
    alignSelf: "center", // Strictly center
}

const $grid: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
}
