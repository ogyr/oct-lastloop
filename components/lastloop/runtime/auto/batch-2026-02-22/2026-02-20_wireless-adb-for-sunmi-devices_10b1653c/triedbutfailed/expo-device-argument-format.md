# Expo Device Argument Format

## What Was Tried
Attempted to pass wireless ADB device ID as `--device` argument to Expo CLI:
```bash
REACT_NATIVE_PACKAGER_HOSTNAME=localhost npx expo run:android --device 192.168.0.128:39671 --no-install
```

## Error
```
CommandError: Could not find device with name: 192.168.0.128:39671
```

## Why It Failed
Expo CLI's `--device` argument expects a device **name** or **model**, not an IP:port serial. For wireless ADB devices, Expo doesn't recognize the IP:port format.

## Correct Approach
Use the `adb_startup` tool with profile:
```bash
# The tool handles wireless device detection internally
adb_startup with profile: "sunmi", build: true
```

Or use the npm script:
```bash
npm run android:device -- V3_MIX_EDLA_GL  # Uses MODEL name from adb devices -l
```

## Device Identification Methods
```bash
# List devices with model names
adb devices -l

# Output shows:
# 192.168.0.128:39671    device product:V3_MIX_EDLA_GL model:V3_MIX_EDLA_GL device:V3_MIX
#                                    ^^^^^^^^^^^^^^^^
#                                    This is the model name to use
```

## Lesson
- `adb -s <serial>` accepts IP:port for wireless devices
- Expo CLI `--device` expects model name, not ADB serial
- Use profile-based tools (`adb_startup`) or model-name scripts (`android:device`) instead of raw Expo commands for wireless devices
