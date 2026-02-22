# minitap installation fails with Python <3.10

## Effect
`oct install oct-private/minitap` fails during setup script with pip dependency resolution error.

## Error
```
ERROR: Could not find a version that satisfies the requirement minitap-mobile-use (from versions: none)
ERROR: No matching distribution found for minitap-mobile-use
```

## Root Cause
The `minitap-mobile-use` Python package requires Python >=3.10 (many versions require >=3.12). The setup script's virtual environment used an older Python version.

## Evidence
```
ERROR: Ignored the following versions that require a different python version: 
  0.0.1.dev0 Requires-Python >=3.10; 2.0.0 Requires-Python >=3.10; 
  2.0.1 Requires-Python >=3.12; ... (all subsequent versions require >=3.12)
```

## Resolution Needed
- Install Python 3.12+ on the system
- Or check if `minitap-mobile-use` requires a private PyPI index
- Retry with `/oct install oct-private/minitap` after Python upgrade
