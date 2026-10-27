# UN Data Commons agent for Microsoft 365 Copilot

A ready-made Copilot agent that answers with official UN statistics from the UN System Data
Commons. It calls the public MCP server directly, and every number comes with its year, unit and
source. The kit's house rules are its instructions.

Tested on 27 October 2026 in the UN Secretariat tenant, installed for one person only.

## What you need

- A **Microsoft 365 Copilot** licence.
- Permission to **upload custom apps**. If you don't have it, the toolkit says: "Your Microsoft
  365 account admin hasn't enabled custom app upload permission." Ask your ICT focal point.
- **VS Code** with the **Microsoft 365 Agents Toolkit** extension (it is suggested when you open
  this folder).

## Install it for yourself

1. Open this folder in VS Code.
2. Click the Agents Toolkit icon. Under **Accounts**, sign in to Microsoft 365 with your work
   account.
3. Under **Lifecycle**, click **Provision** and choose `dev`.
4. Open Copilot (m365.cloud.microsoft/chat), go to **Agents**, and pick **UN Data Commons**.

Provision installs the agent for you only. It does not publish anything to your organization.

## What's inside

| File | What it does |
|---|---|
| `appPackage/declarativeAgent.json` | Name, conversation starters, the instructions file, and Code Interpreter for charts and files |
| `appPackage/instruction.txt` | The house rules |
| `appPackage/ai-plugin.json` | The server URL, no authentication, and the five tools the agent may call |
| `appPackage/mcp-tools-1.json` | The server's own descriptions of those tools |
| `appPackage/manifest.json` | The app's name, icons and developer |

## Things to know

- **Copilot asks you to confirm every call to the server.** The card shows the tool and what it
  sends. A five-country table means five cards. This cannot be switched off.
- **The tools are listed in the files.** The toolkit can also make an agent that discovers the
  tools at runtime, but in our tests Copilot then said the tools were not available. If the server
  adds tools, run **Fetch action from MCP** (open `.vscode/mcp.json`) or edit the two files.
- **Five of the server's six tools.** `get_multi_entity_observations` is left out, because it did
  not work on this server in our tests.
- **Copilot does not read the server's playbook.** The house rules carry its key steps: search,
  check the metadata, then fetch.
- **Charts:** ask it to "run Python". Copilot shows an interactive chart; choose **Display as static
  image** in its menu to see the chart Python drew, with the source line.

## Share it or remove it

- **Named colleagues:** Lifecycle → **Share**, then add their email addresses.
- **Everyone in your organization:** Lifecycle → **Publish to Organization**. This goes to your
  admins for approval, so talk to ICT first.
- **Remove it:** from this folder, run
  `npx -p @microsoft/m365agentstoolkit-cli atk uninstall -i false --mode env --env dev --options m365-app,app-registration --folder .`

Unofficial; not a UN product. The data belongs to the agencies that publish it.
