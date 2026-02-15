// TypeScript
// @ts-ignore

import "react-native-get-random-values"
import { Buffer } from "buffer"
import process from "process"

// Set globals used by the mqtt browser build
// Safe-guard checks so it doesn't double-assign
if (typeof global.Buffer === "undefined") global.Buffer = Buffer
if (typeof global.process === "undefined") global.process = process
