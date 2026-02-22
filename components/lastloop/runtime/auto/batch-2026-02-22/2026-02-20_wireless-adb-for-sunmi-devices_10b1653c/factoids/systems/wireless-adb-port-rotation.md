# Wireless ADB Port Rotation

## Fact
Wireless ADB debugging ports rotate each time the service is re-enabled on the device. The saved IP:port in `.env.sunmi.local` (`192.168.0.128:42667`) was stale.

## Details
- Android 11+ wireless debugging uses dynamic ports
- Two separate ports exist: **pairing port** and **connection port**
- Both ports change when wireless debugging is toggled off/on
- The connection port is shown on the main "Wireless debugging" screen
- The pairing port is only shown during "Pair device with pairing code"

## Implication
Environment files storing `ADB_DEVICE_ID` for wireless devices will periodically become stale. The workflow is:
1. `adb connect <old-port>` fails with "Connection refused"
2. Check device screen for current port
3. Update env file or re-pair if needed
