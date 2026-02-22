# Querying ETRON Odoo via odoo_cli.py

## Effect
Successfully queried the ETRON Odoo (my_etron) for project tasks using the `odoo_cli.py` runtime tool.

## Context
The developer agent role's workflow requires querying "ETRON Odoo" for project tasks. The KNOWLEDGE.md specifies:
- Target: my_etron (my.etron.info, Odoo 15 Enterprise)
- Model: `project.task`
- Filter: stage=Ready, project=onRetail V2 (project_id=9)

## Discovery Path
1. Checked for `odoo_cli.py` in various locations — not found via glob patterns initially
2. Used `find` command to locate the tool at two paths:
   - `.opencode/.oct/sources/oct-private/components/odoo/runtime/odoo_cli.py`
   - `.opencode/odoo/odoo_cli.py`
3. Read `.env.odoo` to confirm connection config (ODOO_URL, ODOO_DB, etc.)
4. Used `--help` to understand CLI syntax

## Working Commands

Find READY stage tickets with normal kanban state:
```bash
python3 .opencode/odoo/odoo_cli.py search project.task \
  '[["stage_id.name","=","Ready"],["project_id","=",9],["kanban_state","=","normal"]]' \
  --fields name,id,stage_id,tag_ids,user_ids,kanban_state \
  --limit 5 --order "id asc"
```

Read full ticket details:
```bash
python3 .opencode/odoo/odoo_cli.py read project.task 11527 \
  --fields name,id,stage_id,tag_ids,user_ids,kanban_state,description,description_us,description_tc,priority,date_deadline,date_last_stage_update
```

## Key Insight
The CLI uses positional arguments for `model` and `domain` (not `--domain` flag). Domain must be valid JSON with proper quoting.
