import Cocoa
import CoreGraphics
import Foundation

// Unbuffered stdout so Electron receives JSON lines immediately
setbuf(stdout, nil)

struct MouseEventPayload: Codable {
    let t: Double        // timestamp in ms since tracker start
    let x: Double        // normalized 0.0 ... 1.0 across display bounds
    let y: Double        // normalized 0.0 ... 1.0 across display bounds (top-left origin)
    let rawX: Double
    let rawY: Double
    let screenW: Double
    let screenH: Double
    let type: String     // "move" | "down" | "up"
    let button: Int      // 0 = left, 1 = right
}

let startTime = CFAbsoluteTimeGetCurrent() * 1000.0
let encoder = JSONEncoder()

func emitEvent(type: String, button: Int = 0) {
    // CGEvent(source: nil)?.location uses top-left origin in global display coordinates!
    let cgLoc = CGEvent(source: nil)?.location ?? CGPoint.zero
    let mainBounds = CGDisplayBounds(CGMainDisplayID())
    let screenW = max(1.0, Double(mainBounds.width))
    let screenH = max(1.0, Double(mainBounds.height))

    let relX = Double(cgLoc.x - mainBounds.origin.x)
    let relY = Double(cgLoc.y - mainBounds.origin.y)

    let normX = max(0.0, min(1.0, relX / screenW))
    let normY = max(0.0, min(1.0, relY / screenH))
    let now = CFAbsoluteTimeGetCurrent() * 1000.0 - startTime

    let payload = MouseEventPayload(
        t: round(now * 10) / 10,
        x: round(normX * 10000) / 10000,
        y: round(normY * 10000) / 10000,
        rawX: round(relX),
        rawY: round(relY),
        screenW: screenW,
        screenH: screenH,
        type: type,
        button: button
    )

    if let data = try? encoder.encode(payload),
       let jsonStr = String(data: data, encoding: .utf8) {
        print(jsonStr)
    }
}

var lastLeftDown = false
var lastRightDown = false
var lastX: Double = -1
var lastY: Double = -1
var tickCount: Int = 0

let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global(qos: .userInteractive))
timer.schedule(deadline: .now(), repeating: .milliseconds(16))
timer.setEventHandler {
    let leftDown = CGEventSource.buttonState(.combinedSessionState, button: .left)
    let rightDown = CGEventSource.buttonState(.combinedSessionState, button: .right)

    if leftDown && !lastLeftDown {
        emitEvent(type: "down", button: 0)
    } else if !leftDown && lastLeftDown {
        emitEvent(type: "up", button: 0)
    } else if rightDown && !lastRightDown {
        emitEvent(type: "down", button: 1)
    } else if !rightDown && lastRightDown {
        emitEvent(type: "up", button: 1)
    } else {
        // Emit move at ~30Hz or when cursor moves
        let loc = CGEvent(source: nil)?.location ?? .zero
        if abs(Double(loc.x) - lastX) > 0.5 || abs(Double(loc.y) - lastY) > 0.5 || tickCount % 2 == 0 {
            emitEvent(type: "move", button: 0)
            lastX = Double(loc.x)
            lastY = Double(loc.y)
        }
    }

    lastLeftDown = leftDown
    lastRightDown = rightDown
    tickCount += 1
}
timer.resume()

dispatchMain()
