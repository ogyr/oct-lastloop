# oct Qualified Names Format

## Fact
oct components use qualified names in format `source/component`, where source is the tool registry name.

## Examples from Session
- `oct-private/glab` — from oct-private source
- `oct-odoobridge/odoobridge` — from oct-odoobridge source
- `oct-serve_onretailbe/onretail-be-dev` — from oct-serve_onretailbe source

## In Batch Install
Multiple qualified names are comma-separated:
```
oct install oct-private/glab,oct-private/adb,oct-private/bridge,...
```

## Implication
When scripting installs, always use qualified names to avoid ambiguity (multiple sources could have same component name).
