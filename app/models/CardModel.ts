import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const CardModel = types
    .model("Card")
    .props({
        id: types.identifier,
        topic: types.string,
        jsonPath: types.optional(types.string, ""), // e.g. "sensors.temp"
        label: types.optional(types.string, "New Card"),
        unit: types.optional(types.string, ""),
        value: types.optional(types.union(types.string, types.number), "--"),
        mathExpression: types.optional(types.string, ""), // e.g. "x * 1.8 + 32"
        showTopic: types.optional(types.boolean, true),
        showGraph: types.optional(types.boolean, false),
        history: types.optional(types.array(types.number), []),
        lastUpdated: types.optional(types.number, 0),
        showFlash: types.optional(types.boolean, false),
        // New features
        width: types.optional(types.number, 1), // 1 or 2
        height: types.optional(types.number, 1), // 1 or 2
        type: types.optional(types.enumeration(["sensor", "button", "switch"]), "sensor"),
        publishTopic: types.optional(types.string, ""),
        publishPayload: types.optional(types.string, ""), // For button
        onPayload: types.optional(types.string, "ON"), // For switch
        offPayload: types.optional(types.string, "OFF"), // For switch
        thresholdMax: types.maybeNull(types.number),
        thresholdMin: types.maybeNull(types.number),
        alertColor: types.optional(types.string, "#FF4444"),
        cardBgColor: types.maybeNull(types.string),
        cardTextColor: types.maybeNull(types.string),
    })
    .actions(withSetPropAction)
    .actions((self) => ({
        setValue(val: string | number) {
            self.value = val
        },
        updateFromPayload(payload: any) {
            try {
                let val = payload
                // Simple JSON path parsing (e.g. "foo.bar")
                if (self.jsonPath) {
                    const parts = self.jsonPath.split(".")
                    for (const part of parts) {
                        if (val && typeof val === "object") {
                            val = val[part]
                        } else {
                            val = undefined
                            break
                        }
                    }
                }

                if (val !== undefined) {
                    if (self.mathExpression && (typeof val === 'number' || !isNaN(Number(val)))) {
                        try {
                            const x = Number(val)
                            const expression = self.mathExpression.replace(/x/g, String(x))
                            // eslint-disable-next-line no-new-func
                            const result = new Function(`return ${expression}`)()
                            val = result
                        } catch (err) {
                            console.warn("Math error:", err)
                        }
                    }

                    self.value = val
                    self.lastUpdated = Date.now()

                    // Update history if value is numeric
                    const numVal = Number(val)
                    if (!isNaN(numVal)) {
                        self.history.push(numVal)
                        // Keep last 30 points
                        if (self.history.length > 30) {
                            self.history.shift()
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to update card value", e)
            }
        },
    }))

export interface Card extends Instance<typeof CardModel> { }
export interface CardSnapshotOut extends SnapshotOut<typeof CardModel> { }
export interface CardSnapshotIn extends SnapshotIn<typeof CardModel> { }

