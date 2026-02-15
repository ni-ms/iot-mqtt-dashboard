import React, { useEffect } from "react"
import { View, ViewStyle, TextStyle, Pressable, Animated } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../models/helpers/RootStoreContext"
import { colors, spacing } from "../theme"
import { Icon } from "./Icon"
import { Text } from "./Text"

export const Toast = observer(function Toast() {
    const { error, errorCode, clearError } = useStores() // We access RootStore properties directly if mixed in, but useStores returns RootStore instance type usually.
    // If RootStore props are not directly on the instance returned by useStores, we might need to adjust.
    // Assuming RootStoreModel props are accessible:

    // Check if useStores returns the RootStore directly
    const store = useStores()
    const errorMessage = store.error
    const code = store.errorCode

    const fadeAnim = React.useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (errorMessage) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()

            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleClose()
            }, 5000)
            return () => clearTimeout(timer)
        }
        return undefined
    }, [errorMessage])

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            store.clearError()
        })
    }

    if (!errorMessage) return null

    return (
        <Animated.View style={[$container, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
            <View style={$content}>
                <View style={$textContainer}>
                    <Text tx={undefined} text="Error" preset="bold" style={$title} />
                    <Text tx={undefined} text={errorMessage} style={$message} />
                    {code && <Text tx={undefined} text={`Code: ${code}`} style={$code} />}
                </View>
                <Pressable onPress={handleClose} hitSlop={10}>
                    <Icon icon="x" size={20} color={colors.text} />
                </Pressable>
            </View>
        </Animated.View>
    )
})

const $container: ViewStyle = {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: colors.palette.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
}

const $content: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: spacing.md,
}

const $textContainer: ViewStyle = {
    flex: 1,
    marginRight: spacing.sm,
}

const $title: TextStyle = {
    color: colors.error,
    marginBottom: spacing.xs,
}

const $message: TextStyle = {
    color: colors.text,
    fontSize: 14,
}

const $code: TextStyle = {
    color: colors.textDim,
    fontSize: 12,
    marginTop: spacing.xs,
    fontFamily: "monospace",
}
