# roles-tool-cross-repo-path

## Fact
The `roles` tool reports agent paths from its configured source repos, which may be outside the current working directory.

## Evidence
```
roles output:
  teams-comms v1.0.0
    path: /Users/clemensgruenberger/WebPro/etron/pos_dev2/.opencode/.oct/sources/oct-private/agents/teams-comms
```

Current working directory: `/Users/clemensgruenberger/WebPro/etron/pos_dev`

The path points to `pos_dev2`, not `pos_dev`. Attempting to read files at this path from `pos_dev` fails silently.

## Implication
When using `roles` output to load role files, verify the path is within the current working directory or handle cross-repo references appropriately.
