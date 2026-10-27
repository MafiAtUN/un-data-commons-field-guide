# UN data with AI assistants: the starter kit

Everything shown in the video series *UN data with AI assistants*, ready to copy. You can use it
in Claude, ChatGPT or Copilot to get official UN statistics with the year and source of every
number, check them, handle gaps honestly, and turn them into charts and briefings.

| Folder | What it is | Where it goes |
|---|---|---|
| `instructions/un-data-rules.md` | The house rules: ten lines that change every answer | Your assistant's standing instructions |
| `skills/` and `dist/*.zip` | Four skills: retrieval, quality control, gaps, briefing | Claude and ChatGPT (upload the zip); VS Code (`.github/skills/`) |
| `copilot-agent/` | A ready-made Copilot agent: the server, five tools, the house rules, starters | Microsoft 365 Copilot (Agents Toolkit) |
| `copilot-studio/agent.md` | The same agent built in Copilot Studio, where the tenant allows it | Microsoft 365 Copilot |
| `vscode/` | `.vscode/mcp.json`, Copilot instructions and the skills | Any folder you open in VS Code |
| `prompts/` | Every prompt from the five videos, numbered as on screen | Copy and paste |
| `sample/uniss-girls.csv` | The running example's data, in the table layout the skills use | For practice |

## The server

```text
https://unsd-datacommons.gcp.un-icc.cloud/mcp
```

This is the UN System Data Commons' own MCP server. It is public and read-only, and needs no key
and no account.

## Connect it

Menus as of October 2026. They change, so if a label differs, look for the nearest match.

**Claude** (claude.ai and Claude Desktop):

1. Customize → Connectors → **+** → Add custom connector. Name it `UN Data Commons` and paste the
   URL.
2. In a chat, turn the connector on from the **+** menu, then allow its tools when asked.
3. On the Free plan you can add one custom connector. On Team and Enterprise plans, an owner adds
   connectors for the organization.

**ChatGPT:**

1. Settings → Apps (or Plugins). If you are asked to, turn on Developer mode under Advanced
   settings.
2. Add a custom MCP server: name it, paste the URL, choose **No authentication**, and accept the
   warning.
3. In a chat, pick it from the **+** menu.
4. Custom servers need Plus or above. In Business and Enterprise workspaces an admin may need to
   allow them.

**Copilot:**

- **Microsoft 365 Copilot:** install the ready-made agent in
  [`copilot-agent/`](copilot-agent/README.md) with the Microsoft 365 Agents Toolkit in VS Code:
  sign in, then **Provision**. It worked in the UN Secretariat tenant (October 2026). You need a
  Copilot licence and permission to upload custom apps. Copilot asks you to confirm each call to
  the server. Copilot Studio is the other route ([`copilot-studio/agent.md`](copilot-studio/agent.md)),
  but in the UN Secretariat tenant it would not attach the server.
- **GitHub Copilot in VS Code:** copy the `vscode/` folder's contents into your project, open
  `.vscode/mcp.json`, click **Start**, and use Copilot Chat in Agent mode.

**Claude Code:**

```bash
claude mcp add --transport http un-data https://unsd-datacommons.gcp.un-icc.cloud/mcp
```

## Test it

Ask:

```text
Using the UN Data Commons tools: what share of women aged 20–24 in Niger were married
or in a union before age 18? Give the year and the source, and tell me if the figure
is more than five years old.
```

You should see a tool call, then 76.3% for 2012, from the UN Statistics Division's Global SDG
Indicators Database, flagged as old (as of October 2026). If you get a number with no tool call,
the assistant is answering from memory, which means the connector is not switched on in that
chat.

## Add the house rules and the skills

- **House rules:** paste the block from `instructions/un-data-rules.md` into your project's or
  agent's instructions.
- **Skills in Claude:** Customize → Skills → **+** → Upload a skill, then pick a zip from
  `dist/`. Skills need "Code execution and file creation" switched on in Settings →
  Capabilities.
- **Skills in ChatGPT:** Plugins → Skills → **Add** → Upload from your computer, one zip at a
  time. ChatGPT offers uploaded skills only in **Work** mode (+ → pick the skill), not in Chat
  mode. In our tests on 27 October 2026, Work mode did not read the server's playbook and would
  not search the UN Data Commons. So for UN data in ChatGPT, use a Chat-mode project with the
  house rules for now.
- **Skills in VS Code:** they are already in `vscode/.github/skills/`. VS Code also reads
  `.claude/skills/`, so one folder serves both Copilot and Claude Code.

| Skill | What it does |
|---|---|
| `un-data-retrieval` | Finds the indicator, checks coverage, then fetches with the year, unit and source; asks which countries an ambiguous group means |
| `un-data-qc` | Audits a table or a draft and returns a QC log: numbers, years, sources, units, plausibility, coverage |
| `un-data-gaps` | Finds the most recent value, fills gaps only when asked and labels them, tests whether filling changes the answer, writes data notes |
| `un-briefing` | Charts with findings as titles and source lines, and notes where every number has its year and footnote and is checked |

## Ground rules

- **Only public data goes into these prompts.** Follow your entity's rules on which AI tools you
  may use, and don't paste confidential drafts.
- **The assistant drafts; you sign.** Check the numbers before anything leaves your desk. The QC
  skill makes that fast. It does not make it optional.
- **The data belongs to the agencies that publish it.** Cite them, not the assistant.

To rebuild the zips after editing a skill, run `python3 kit/build.py`.

Made by Mafizul Islam. This is not an official UN product, and it is not endorsed by the
United Nations.
