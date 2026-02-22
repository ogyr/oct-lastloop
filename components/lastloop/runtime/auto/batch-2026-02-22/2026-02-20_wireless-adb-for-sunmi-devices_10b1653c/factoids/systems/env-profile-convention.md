# ETRON Env Profile Convention

## Fact
ETRON uses `.env.<profile>.local` files for device/instance-specific configuration.

## Profiles Observed
- `.env.sunmi.local` — Sunmi V3 MIX device (wireless ADB)
- `.env.emulator.local` — Android emulator
- `.env.brick.local` — Physical tablet/phone
- `.env.brick2.local` — Another physical device
- `.env.example.local` — Template file

## Profile Contents
Each profile contains:
```bash
ETRON_USER=<username>      # Odoo login
ETRON_PASS=<password>      # Odoo password
ETRON_DB=<database-id>     # Database identifier (e.g., 069c17a06c)
ADB_DEVICE_ID=<device-id>  # ADB serial or IP:port
```

## Usage
The `adb_startup` tool and `adb_login` tool accept a `profile` parameter that reads from the corresponding `.env.<profile>.local` file.
