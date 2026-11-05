# Blender MCP setup

Lets Claude Code drive Blender (create/edit models, materials, export glTF) using the
open-source [`blender-mcp`](https://github.com/ahujasid/blender-mcp) server.

Blender must run on **your own machine**. Use this from local Claude Code or the Claude
desktop app, not from a cloud session.

## One-time setup

1. Install Blender 3.0+ and [`uv`](https://docs.astral.sh/uv/getting-started/installation/).
2. Download `addon.py` from the blender-mcp repo.
3. In Blender: Edit > Preferences > Add-ons > Install..., pick `addon.py`, tick **Interface: Blender MCP**.
4. In the 3D viewport press `N`, open the **BlenderMCP** tab and click **Connect to Claude**
   (listens on `localhost:9876`).
5. Open this repo in Claude Code. The server is declared in `.mcp.json`; approve it when prompted.
   Check with `/mcp` that `blender` is connected.

Claude Desktop alternative: add the same `blender` entry to `claude_desktop_config.json`.

## Exporting for the game

Game models live in `public/models/`. Ask Claude to export as `.glb` (glTF Binary, Apply Modifiers on),
and keep them small (the game loads them in the browser).

## Notes

- The server can run arbitrary Python inside Blender. Save your work first and only connect on projects you trust.
- Optional: set `BLENDER_HOST` / `BLENDER_PORT` env vars if the addon runs elsewhere.
