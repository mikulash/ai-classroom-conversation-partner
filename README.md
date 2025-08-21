# AI Conversation Partner for Practicing Classroom Communication
_aka my Master's thesis at Masaryk University software engineering program in 2025_

An AI-powered simulation platform that helps students of pedagogical faculty practice classroom conversations in a safe, controlled virtual environment.
This application provides pedagogy students with realistic training scenarios featuring virtual students, parents, and colleagues.


## Key Features

- **Realistic Conversation Practice**: Engage with AI-powered virtual stakeholders that respond naturally to different teaching situations
- **Flexible Communication**: Support for both real-time conversations and asynchronous messaging
- **Safe Learning Environment**: Practice difficult conversations without real-world consequences
- **Adaptive AI Behavior**: Virtual characters respond according to designed behavioral blueprints

## Use Cases

- **Student Teachers**: Practice parent-teacher conferences, student counseling, and classroom management
- **Education Programs**: Supplement traditional teaching practice with controlled simulation exercises
- **Professional Development**: Experienced educators can rehearse challenging conversations

## Technology

Built using modern large language models and avatar rendering technologies to create immersive, educational training experiences.
- OpenAI SDK
- xAi SDK
- Anthropic SDK
- Turborepo
- Vite for web app, Tauri for desktop app, Tsup for backend
- avatars are rendered with a slightly customized version of the [TalkingHead](https://github.com/met4citizen/TalkingHead) project.


## Sharing This Project as a Clean New Repository

Where Git files are stored:
- Git history and metadata live in a hidden .git directory at the project root (and possibly inside submodules or nested repos). If present, each .git directory fully contains the repo’s history and config.
- .gitignore and .gitattributes are plain text files that control ignore rules and attributes. They are not required to delete Git history; you may keep them if useful.

Fast manual method (PowerShell):
1. Navigate to the project root:
   - cd C:\Users\heinz\WebstormProjects\FigurantComplete
2. Remove Git history by deleting the .git directory:
   - Remove-Item -Path .git -Recurse -Force
   - If you have submodules or nested repos, also remove any nested .git directories.
3. Initialize a fresh repository:
   - git init
   - git add .
   - git commit -m "Initial import"
   - git branch -M main
   - git remote add origin <your-new-remote-url>
   - git push -u origin main

Automated method (PowerShell script included):
- Use remove-git-metadata.ps1 to find and delete all .git directories recursively. It also supports optional removal of .gitignore and .gitattributes.

Examples:
- Preview (no changes):
  - PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1 -DryRun
- Remove all .git directories with confirmations:
  - PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1
- Also remove .gitignore and .gitattributes, no prompts:
  - PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1 -IncludeGitFiles -Force

Then initialize a new repo as shown in step 3 above.
