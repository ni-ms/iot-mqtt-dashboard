import React, { useEffect, useRef } from "react"
import { View, TextStyle, ViewStyle, Pressable, Animated, Dimensions } from "react-native"
import { Text } from "../components/Text"
import { Card } from "../models/CardModel"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "../theme"
import { Button } from "../components/Button"
import { useStores } from "../models/helpers/RootStoreContext"

interface DataCardProps {
    card: Card
    isEditMode?: boolean
    onPress: () => void
}

export const DataCard = observer(function DataCard(props: DataCardProps) {
    const { card, onPress, isEditMode } = props
    const { themeStore, mqttStore } = useStores()
    const fadeAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (!card.showFlash) return

        // Subtle opacity flash when value changes
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.6,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }, [card.lastUpdated, card.showFlash, fadeAnim])

    // Sizing calculations
    const screenWidth = Dimensions.get("window").width
    const p = spacing.md
    const colWidth = (screenWidth - p * 3) / 2
    const width = card.width === 2 ? (screenWidth - p * 2) : colWidth
    const height = card.height === 2 ? (colWidth * 2 + p) : colWidth

    // Logic for alerts and custom colors
    const numValue = Number(card.value)
    const isAlert = !isNaN(numValue) && (
        (card.thresholdMax !== null && numValue > card.thresholdMax) ||
        (card.thresholdMin !== null && numValue < card.thresholdMin)
    )

    const bgColor = isAlert ? card.alertColor : (card.cardBgColor || themeStore.cardBgColor || colors.palette.neutral100)
    const textColor = card.cardTextColor || themeStore.primaryTextColor || colors.text
    const accentColor = themeStore.accentColor || colors.palette.primary500

    const renderGraph = () => {
        if (!card.showGraph || card.history.length < 2) return null
        const max = Math.max(...card.history)
        const min = Math.min(...card.history)
        const range = max - min || 1
        return (
            <View style={$graphWrapper}>
                {card.history.map((val, i) => {
                    const h = ((val - min) / range) * 30 + 5
                    return (
                        <View
                            key={i}
                            style={[
                                $graphBar,
                                { height: h, backgroundColor: accentColor, opacity: 0.3 + (i / card.history.length) * 0.7 }
                            ]}
                        />
                    )
                })}
            </View>
        )
    }

    const handleAction = () => {
        if (card.type === "button") {
            mqttStore.publish(card.publishTopic, card.publishPayload)
        } else if (card.type === "switch") {
            const isCurrentlyOn = String(card.value) === card.onPayload
            const nextPayload = isCurrentlyOn ? card.offPayload : card.onPayload
            mqttStore.publish(card.publishTopic, nextPayload)
        }
    }

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Pressable
                style={[$container, { width, height, backgroundColor: bgColor }]}
                onPress={isEditMode ? onPress : (card.type !== "sensor" ? handleAction : onPress)}
            >
                <View style={$header}>
                    <Text preset="subheading" text={card.label} style={[$label, { color: textColor }]} />
                    {card.showTopic && <Text preset="default" text={card.topic} style={[$topic, { color: textColor, opacity: 0.7 }]} />}
                </View>

                <View style={$content}>
                    {card.type === "sensor" ? (
                        <>
                            <Text preset="heading" text={String(card.value)} style={[$value, { color: accentColor }]} />
                            <Text preset="bold" text={card.unit} style={[$unit, { color: textColor, opacity: 0.7 }]} />
                        </>
                    ) : card.type === "button" ? (
                        <View style={$actionOverlay}>
                            <Text text="Tap to execute" style={{ color: textColor, fontSize: 12, marginBottom: spacing.xs }} />
                            <Button text="SEND" onPress={handleAction} preset="filled" style={{ minWidth: 60 }} />
                        </View>
                    ) : (
                        <View style={$actionOverlay}>
                            <Text text={String(card.value) === card.onPayload ? "ON" : "OFF"} preset="heading" style={{ color: accentColor }} />
                            <Button
                                text={String(card.value) === card.onPayload ? "TURN OFF" : "TURN ON"}
                                onPress={handleAction}
                                preset="reversed"
                                style={{ marginTop: spacing.xs }}
                            />
                        </View>
                    )}
                </View>

                {card.type === "sensor" && renderGraph()}

                {isEditMode && (
                    <View style={$editOverlay}>
                        <Pressable
                            style={$resizeBtn}
                            onPress={() => {
                                // Simple cycle toggle for dimensions
                                if (card.width === 1 && card.height === 1) card.setProp("width", 2)
                                else if (card.width === 2 && card.height === 1) card.setProp("height", 2)
                                else { card.setProp("width", 1); card.setProp("height", 1) }
                            }}
                        >
                            <Text text="SIZE" style={{ fontSize: 10, color: 'white' }} />
                        </Pressable>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    )
})

const $graphWrapper: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 40,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral200,
    paddingTop: spacing.xs,
}

const $graphBar: ViewStyle = {
    flex: 1,
    backgroundColor: colors.palette.primary500,
    marginHorizontal: 1,
    borderRadius: 1,
}

const $container: ViewStyle = {
    backgroundColor: colors.palette.neutral100,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.palette.neutral300,
}

const $header: ViewStyle = {
    flexDirection: "column",
    marginBottom: spacing.sm,
}

const $label: TextStyle = {
    color: colors.text,
    fontWeight: "bold",
}

const $topic: TextStyle = {
    color: colors.textDim,
    fontSize: 12,
}

const $content: ViewStyle = {
    flexDirection: "row",
    alignItems: "baseline",
}

const $value: TextStyle = {
    color: colors.palette.primary500,
    marginRight: spacing.xs,
}

const $unit: TextStyle = {
    color: colors.textDim,
}

const $actionOverlay: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
}

const $editOverlay: ViewStyle = {
    position: "absolute",
    right: 4,
    bottom: 4,
}

const $resizeBtn: ViewStyle = {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
}
