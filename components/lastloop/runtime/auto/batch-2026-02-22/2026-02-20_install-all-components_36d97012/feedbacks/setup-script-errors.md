# Component setup scripts can fail independently

## Effect
A component marked "installed with errors" still appears in the installed list, but with a warning and log path.

## Evidence
```
Warning: oct-private/minitap: installed with errors — setup script exited with code 1
  Log: /Users/.../.opencode/.oct/logs/oct-private/minitap/log_minitap_cd093e4_2026-02-20T00-14-22-209Z.txt
```

## Behavior
- Setup script failures don't abort the entire install batch
- Other components in the same install command proceed
- Failed component is marked with warning, not removed
- Log file path provided for diagnosis
