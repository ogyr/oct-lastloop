# Neko Collaborative Browser

## What It Is
Neko (github.com/m1k1o/neko) is an open-source self-hosted virtual browser that streams via WebRTC and supports multi-user interaction.

## Architecture
```
Docker container:
- Chromium/Firefox (headed)
- Xvfb (virtual display)
- PulseAudio (audio)
- WebRTC server (streaming)
- CDP endpoint (for automation)
```

## Key Features
- WebRTC streaming (~50ms latency)
- Full mouse/keyboard/clipboard control
- Multi-user with control passing
- Embeddable JS client

## Integration Pattern
```
User ←──WebRTC──→ Neko ←──CDP──→ Playwright agent
                      ↓
                  Chromium
```

Both user (via WebRTC) and agent (via CDP) interact with the same browser instance, seeing the same page in real-time.
