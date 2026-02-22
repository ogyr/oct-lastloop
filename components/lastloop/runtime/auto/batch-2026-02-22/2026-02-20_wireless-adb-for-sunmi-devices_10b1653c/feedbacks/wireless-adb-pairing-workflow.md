# Wireless ADB Pairing Workflow

## Effect
Successfully established wireless ADB connection to Sunmi V3 MIX device from Mac.

## Problem
The saved ADB device ID in `.env.sunmi.local` used an outdated port (`192.168.0.128:42667`). Connection failed with "Connection refused" because wireless ADB ports rotate each time the service is re-enabled.

## Solution
1. Put device in pairing mode: Settings → Developer options → "Pair device with pairing code"
2. Pair with `adb pair <ip:port> <code>` using the pairing port (different from connection port)
3. Connect with `adb connect <ip:port>` using the main wireless debugging port
4. Update `.env.sunmi.local` with new port

## Key Commands
```bash
# Pair (one-time, uses pairing port)
adb pair 192.168.0.128:39843 330853

# Connect (uses main wireless debugging port)
adb connect 192.168.0.128:39671

# Verify connection
adb devices -l
```

## Critical Details
- Pairing port ≠ Connection port (two different numbers)
- Pairing is one-time per device; connection is needed each time ADB server restarts
- `adb reverse tcp:8081 tcp:8081` for Metro bundler access works over wireless ADB
- Device IP must be on same subnet as development machine for Metro to work
