import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle } from "react-native"
import { Screen } from "../components/Screen"
import { Text } from "../components/Text"
import { TextField } from "../components/TextField"
import { Button } from "../components/Button"
import { Switch } from "../components/Toggle/Switch"
import { useStores } from "../models/helpers/RootStoreContext"
import { useHeader } from "../utils/useHeader"
import { CardSnapshotIn } from "../models/CardModel"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

interface CardEditScreenProps extends AppStackScreenProps<"CardEdit"> { }

export const CardEditScreen: FC<CardEditScreenProps> = observer(function CardEditScreen(_props) {
    const { navigation, route } = _props
    const { dashboardStore, mqttStore } = useStores()
    const cardId = route.params?.cardId
    const existingCard = cardId ? dashboardStore.cards.find(c => c.id === cardId) : undefined

    useHeader({
        title: cardId ? "Edit Card" : "New Card",
        leftIcon: "back",
        onLeftPress: () => navigation.goBack(),
    }, [cardId, navigation])

    // State for all fields
    const [label, setLabel] = useState(existingCard?.label || "")
    const [topic, setTopic] = useState(existingCard?.topic || "")
    const [jsonPath, setJsonPath] = useState(existingCard?.jsonPath || "")
    const [mathExpression, setMathExpression] = useState(existingCard?.mathExpression || "")
    const [unit, setUnit] = useState(existingCard?.unit || "")
    const [showTopic, setShowTopic] = useState(existingCard?.showTopic ?? true)
    const [showGraph, setShowGraph] = useState(existingCard?.showGraph ?? false)
    const [showFlash, setShowFlash] = useState(existingCard?.showFlash ?? false)

    // New features state
    const [type, setType] = useState<any>(existingCard?.type || "sensor")
    const [publishTopic, setPublishTopic] = useState(existingCard?.publishTopic || "")
    const [publishPayload, setPublishPayload] = useState(existingCard?.publishPayload || "")
    const [onPayload, setOnPayload] = useState(existingCard?.onPayload || "ON")
    const [offPayload, setOffPayload] = useState(existingCard?.offPayload || "OFF")
    const [thresholdMax, setThresholdMax] = useState(existingCard?.thresholdMax?.toString() || "")
    const [thresholdMin, setThresholdMin] = useState(existingCard?.thresholdMin?.toString() || "")
    const [alertColor, setAlertColor] = useState(existingCard?.alertColor || "#FF4444")
    const [cardBgColor, setCardBgColor] = useState(existingCard?.cardBgColor || "")
    const [cardTextColor, setCardTextColor] = useState(existingCard?.cardTextColor || "")

    const handleSave = () => {
        if (!topic) return

        const cardData: CardSnapshotIn = {
            id: cardId || Math.random().toString(36).substr(2, 9),
            label,
            topic,
            jsonPath,
            mathExpression,
            unit,
            showTopic,
            showGraph,
            showFlash,
            type,
            publishTopic: publishTopic || topic, // default to sub topic if empty
            publishPayload,
            onPayload,
            offPayload,
            thresholdMax: thresholdMax ? parseFloat(thresholdMax) : null,
            thresholdMin: thresholdMin ? parseFloat(thresholdMin) : null,
            alertColor,
            cardBgColor: cardBgColor || null,
            cardTextColor: cardTextColor || null,
            width: existingCard?.width || 1,
            height: existingCard?.height || 1,
        }

        if (cardId && existingCard) {
            dashboardStore.updateCard(cardId, cardData)
        } else {
            dashboardStore.addCard(cardData)
        }
        mqttStore.subscribe(topic)
        navigation.goBack()
    }

    const handleDelete = () => {
        if (cardId) {
            dashboardStore.removeCard(cardId)
            navigation.goBack()
        }
    }

    const Section = ({ title, children }: { title: string, children: any }) => (
        <View style={$section}>
            <Text text={title} preset="subheading" style={$sectionTitle} />
            {children}
        </View>
    )

    return (
        <Screen style={$root} preset="scroll">
            <View style={$content}>
                <Section title="Widget Type">
                    <View style={$row}>
                        {["sensor", "button", "switch"].map((t) => (
                            <Button
                                key={t}
                                text={t}
                                onPress={() => setType(t)}
                                preset={type === t ? "filled" : "default"}
                                style={{ flex: 1, marginRight: spacing.xs }}
                            />
                        ))}
                    </View>
                </Section>

                <Section title="Basic Info">
                    <TextField label="Label" value={label} onChangeText={setLabel} placeholder="Ex: Temperature" containerStyle={$field} />
                    <TextField label="MQTT Sub Topic" value={topic} onChangeText={setTopic} autoCapitalize="none" containerStyle={$field} />
                    {type === "sensor" && (
                        <>
                            <TextField label="JSON Path" value={jsonPath} onChangeText={setJsonPath} autoCapitalize="none" containerStyle={$field} />
                            <TextField label="Calculation (x = value)" value={mathExpression} onChangeText={setMathExpression} autoCapitalize="none" containerStyle={$field} />
                            <TextField label="Unit" value={unit} onChangeText={setUnit} placeholder="Ex: °C" containerStyle={$field} />
                        </>
                    )}
                </Section>

                {(type === "button" || type === "switch") && (
                    <Section title="Action Settings">
                        <TextField label="Publish Topic" value={publishTopic} onChangeText={setPublishTopic} autoCapitalize="none" containerStyle={$field} />
                        {type === "button" ? (
                            <TextField label="Publish Payload" value={publishPayload} onChangeText={setPublishPayload} containerStyle={$field} />
                        ) : (
                            <View style={$row}>
                                <TextField label="ON Payload" value={onPayload} onChangeText={setOnPayload} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
                                <TextField label="OFF Payload" value={offPayload} onChangeText={setOffPayload} containerStyle={{ flex: 1 }} />
                            </View>
                        )}
                    </Section>
                )}

                {type === "sensor" && (
                    <Section title="Threshold Alerts">
                        <View style={$row}>
                            <TextField label="Max Limit" value={thresholdMax} onChangeText={setThresholdMax} keyboardType="numeric" containerStyle={{ flex: 1, marginRight: spacing.sm }} />
                            <TextField label="Min Limit" value={thresholdMin} onChangeText={setThresholdMin} keyboardType="numeric" containerStyle={{ flex: 1 }} />
                        </View>
                        <TextField label="Alert Color (Hex)" value={alertColor} onChangeText={setAlertColor} containerStyle={$field} />
                    </Section>
                )}

                <Section title="Appearance & Layout">
                    <View style={$row}>
                        <TextField label="Card Hex Bg" value={cardBgColor} onChangeText={setCardBgColor} containerStyle={{ flex: 1, marginRight: spacing.sm }} placeholder="#FFFFFF" />
                        <TextField label="Text Hex" value={cardTextColor} onChangeText={setCardTextColor} containerStyle={{ flex: 1 }} placeholder="#000000" />
                    </View>
                    <View style={$toggleRow}><Text text="Show Topic" /><Switch value={showTopic} onValueChange={setShowTopic} /></View>
                    {type === "sensor" && <View style={$toggleRow}><Text text="Show Graph" /><Switch value={showGraph} onValueChange={setShowGraph} /></View>}
                    <View style={$toggleRow}><Text text="Flash on Update" /><Switch value={showFlash} onValueChange={setShowFlash} /></View>
                </Section>

                <Button text="Save" onPress={handleSave} preset="filled" style={$saveButton} />
                {cardId && <Button text="Delete" onPress={handleDelete} preset="reversed" style={$deleteButton} />}
            </View>
        </Screen>
    )
})

const $root: ViewStyle = { flex: 1 }
const $content: ViewStyle = { padding: spacing.md }
const $section: ViewStyle = { marginBottom: spacing.xl }
const $sectionTitle: TextStyle = { marginBottom: spacing.sm, color: colors.palette.neutral500 }
const $field: ViewStyle = { marginBottom: spacing.md }
const $row: ViewStyle = { flexDirection: 'row', marginBottom: spacing.md }
const $toggleRow: ViewStyle = { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }
const $saveButton: ViewStyle = { marginTop: spacing.md }
const $deleteButton: ViewStyle = { marginTop: spacing.sm, borderColor: colors.error }
