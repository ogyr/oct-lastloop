# adb reverse for port ranges enables service discovery on physical devices

When a mobile app needs to discover a service running on the host machine via localhost, you need to forward each port individually. Android's adb reverse doesn't support ranges directly.

**Pattern for port ranges:**
```bash
DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
for port in $(seq 7654 7664); do
  adb -s "$DEVICE" reverse tcp:$port tcp:$port
done
```

**Verify with:**
```bash
adb -s "$DEVICE" reverse --list
# host-19 tcp:7654 tcp:7654
# host-19 tcp:7655 tcp:7655
# ...
```

This is essential for any service that uses HTTP-based port discovery (DevBridge scans 7654-7664, looking for a `/bridge` endpoint that returns `{wsPort}`).
