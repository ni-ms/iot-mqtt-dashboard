// TypeScript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react"
// eslint-disable-next-line no-restricted-imports
import { View, Text, StyleSheet } from "react-native"

type Props = {
  label: string
  unit?: string
  value: string | number | boolean | unknown
  isStale: boolean
}

export function WidgetCard({ label, unit, value, isStale }: Props) {
  const display =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "—")

  // @ts-ignore
  return (
    <View style={[styles.card, isStale && styles.stale]}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {/* eslint-disable-next-line react-native/no-color-literals */}
        <View style={[styles.dot, { backgroundColor: isStale ? "#F59E0B" : "#10B981" }]} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {display}
        {!!unit && typeof value !== "object" && <Text style={styles.unit}> {unit}</Text>}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    padding: 14,
  },
  dot: { borderRadius: 5, height: 10, width: 10 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  // eslint-disable-next-line react-native/no-color-literals
  label: { color: "#374151", flex: 1, fontSize: 14, fontWeight: "600", marginRight: 8 },
  stale: {
    opacity: 0.8,
  },
  unit: { color: "#6B7280", fontSize: 16, fontWeight: "500" },
  value: { color: "#111827", fontSize: 24, fontWeight: "700" },
})
