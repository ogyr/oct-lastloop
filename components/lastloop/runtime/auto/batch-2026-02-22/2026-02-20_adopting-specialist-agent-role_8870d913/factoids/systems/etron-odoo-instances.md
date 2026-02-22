# ETRON Odoo Instance Naming Convention

## Canonical Names

| Name | What It Is | Version | URL |
|------|-----------|---------|-----|
| **my_etron** | ETRON internal ERP — tickets, HR, projects | Odoo 15 Ent | my.etron.info |
| **onretail_be** | SaaS product — customer/dev ERP instances | Odoo 16 CE | *.etron.info |
| **onretail_be_dev** | Local Docker dev build | Odoo 16 CE | localhost:8069 |

## Tool Mapping

| Tool/Command | Target |
|-------------|--------|
| `/etron` | my_etron |
| `/onretail-be` | onretail_be (Playwright) |
| `onretail-be-dev` tool | onretail_be_dev (Docker) |
| `odoo` tool | Generic — connects based on `.env.odoo` |
| `odoobridge` | Any Odoo with `agent_bridge` module |

## Critical Distinction
"Odoo" in documentation often refers to **my_etron** (the internal ERP), not the onRetail product backend. Always verify context.

## Source
- Developer agent KNOWLEDGE.md from oct-private
