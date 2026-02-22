# adb reverse Required for Physical Device DevBridge Connection

On a physical Android device, `localhost` refers to the device itself, not the host machine. running the bridge server. `adb reverse` creates a tunnel that forwards device's `localhost:PORT` to host machine's `localhost:PORT`. This is the DevBridge client on the discover and connect to the bridge server.

**Examples:**
```bash
DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
for port in $(seq 7654 7664); do
  adb -s "$DEVICE" reverse tcp:$port tcp:$port
done
```
- **Result:** Tunnels created for ports 7654-7664
- **Verified:** 2026-02-21
- **Discovered via:** Trial and error during bridge setup
  - **Convo context:** Agent trying to connect JS bridge on physical Android device (Sunmi V3 MIX)
  - **Confidence:** high
