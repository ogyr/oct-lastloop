# Effect (Failed): Reliable wireless ADB connection to Sunmi device

## Summary
Throughout the conversation, the wireless ADB connection to the Sunmi V3 MIX at 192.168.0.128 was extremely unreliable. The agent repeatedly tried `adb connect 192.168.0.128:39671` and `adb connect 192.168.0.128:5555` but connections were refused or timed out. The USB connection (identified as `adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp`) was more reliable but also dropped intermittently — at least 3 times during the conversation the device went fully offline.

## Attempts
### 1. Direct wireless connect to port 39671
- **What was tried:** `adb connect 192.168.0.128:39671` (the wireless debugging port)
- **Why it failed:** Connection refused or timed out repeatedly. The port number (39671) suggests this was set up via wireless debugging pairing, which may have an expiring session.
- **Example:**
  ```bash
  adb connect 192.168.0.128:39671
  # → failed to connect to '192.168.0.128:39671': Connection refused
  ```

### 2. Fallback to port 5555
- **What was tried:** `adb connect 192.168.0.128:5555` (standard ADB TCP port)
- **Why it failed:** Host reported as down — tcpip mode likely not enabled
- **Example:**
  ```bash
  adb connect 192.168.0.128:5555
  # → failed to connect to '192.168.0.128:5555': Host is down
  ```

### 3. Polling loop for device appearance
- **What was tried:** A while loop polling `adb devices` and retrying connect every 2 seconds
- **Why it partially worked:** Eventually the USB connection reappeared (user had to physically re-enable it), but wireless never came back reliably
- **Example:**
  ```bash
  while true; do
    adb devices -l 2>&1 | grep -q "device " && echo "DEVICE FOUND" && break
    adb connect 192.168.0.128:39671 2>/dev/null
    adb connect 192.168.0.128:5555 2>/dev/null
    sleep 2
  done
  ```
