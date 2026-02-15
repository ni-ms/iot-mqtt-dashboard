import { MMKV } from "react-native-mmkv"

// MMKV is a JSI-based storage library, so it won't work in Expo Go or Web without a fallback.
// We use a getter to avoid crashes on import.
let _storage: MMKV | null = null

export const getStorage = () => {
  if (!_storage) {
    try {
      _storage = new MMKV()
    } catch (e) {
      console.error("Failed to initialize MMKV. If you are in Expo Go, please use a development build (npm run android/ios).", e)
      // Return a dummy object to prevent immediate crashes, though operations will fail.
      return {
        getString: () => null,
        set: () => { },
        delete: () => { },
        clearAll: () => { },
      } as unknown as MMKV
    }
  }
  return _storage
}

export const storage = getStorage()

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export function load<T>(key: string): T | null {
  let almostThere: string | null = null
  try {
    almostThere = loadString(key)
    return JSON.parse(almostThere ?? "") as T
  } catch {
    return (almostThere as T) ?? null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch { }
}

/**
 * Burn it all to the ground.
 */
export function clear(): void {
  try {
    storage.clearAll()
  } catch { }
}
