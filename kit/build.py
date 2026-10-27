"""
Package the kit: one ZIP per skill (the format Claude and ChatGPT accept for
upload) and a copy of the skills in vscode/.github/skills, where GitHub Copilot
in VS Code looks for them.

    python3 kit/build.py
"""
import pathlib
import shutil
import zipfile

KIT = pathlib.Path(__file__).resolve().parent
SKILLS = KIT / "skills"
DIST = KIT / "dist"
VSCODE = KIT / "vscode" / ".github" / "skills"


def main():
    DIST.mkdir(exist_ok=True)
    shutil.rmtree(VSCODE, ignore_errors=True)
    for folder in sorted(p for p in SKILLS.iterdir() if (p / "SKILL.md").exists()):
        # the folder itself goes inside the zip, and its name must match the skill's name
        with zipfile.ZipFile(DIST / f"{folder.name}.zip", "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(folder.rglob("*")):
                if f.is_file():
                    z.write(f, f.relative_to(SKILLS))
        shutil.copytree(folder, VSCODE / folder.name)
        print(f"{folder.name}: dist/{folder.name}.zip, vscode/.github/skills/{folder.name}/")


if __name__ == "__main__":
    main()
