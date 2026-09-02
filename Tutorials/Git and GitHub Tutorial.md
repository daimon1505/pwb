
# Git & GitHub: A Beginner's Guide

This tutorial teaches you the basics of Git and GitHub for complete beginners, using GitHub Desktop as the primary tool. The command-line interface (CLI) is mentioned at the end as an advanced workflow you can learn later.

## What is Git? (Simple terms)
- Git is a tool that tracks changes to files in a project. Think of it as a time machine for your code or documents.
- Key ideas:
	- Repository (repo): a folder tracked by Git.
	- Commit: a saved snapshot of your project.
	- Branch: a copy of your project where you can make changes without affecting the main version.
	- Remote: a copy of your repo hosted online (for example, on GitHub).

## What is GitHub?
- GitHub is a website that hosts Git repositories so you and others can collaborate, back up work, and review changes.
- It adds features like pull requests (to propose changes), issues (to track tasks), and an easy web interface.

## Getting started (overview)
1. Install GitHub Desktop.
2. Create or sign in to a GitHub account.
3. Create or clone a repository with GitHub Desktop.
4. Make changes, commit them, and push them to GitHub.
5. Use branches and pull requests for collaboration.

## Install GitHub Desktop and sign in
1. Download GitHub Desktop from https://desktop.github.com and install it for macOS/Windows.
2. Open GitHub Desktop.
3. Sign in with your GitHub account (or create one at https://github.com).

## Create a new repository (project) using GitHub Desktop
1. In GitHub Desktop, choose File → New repository.
2. Fill in the repository name, description (optional), and local path (where files will be stored on your computer).
3. Choose a default branch name (usually `main`) and optionally add a README.
4. Click Create repository. Git is now tracking that folder locally.

## Clone an existing GitHub repository (download a project)
1. On GitHub (website), go to the repository you want to copy and click the "Code" button, then copy the URL.
2. In GitHub Desktop, choose File → Clone repository, paste the URL (or find it in the list), pick a local path, and click Clone.

## Basic workflow in GitHub Desktop (step-by-step)
1. Make a change: edit or add files in the local repository folder using your editor.
2. Switch to GitHub Desktop — it shows changed files under the "Changes" tab.
3. Review changes: click a file to see what changed (diff view shows additions/removals).
4. Write a short, clear commit message in the "Summary" box (e.g., "Fix typo in README").
5. Click "Commit to main" (or the current branch) to save the snapshot locally.
6. Push to GitHub: click "Push origin" (top bar) to upload commits to the remote repository on GitHub.
7. On GitHub.com the changes are now visible in the repository.

## Using branches (work safely on features)
- Why branches? They let you work on changes without affecting the main project until you are ready.
1. In GitHub Desktop, click the current branch name and choose "New branch." Give it a descriptive name (e.g., `add-intro`).
2. Make your changes locally and commit them on this branch.
3. Push the branch: click "Push origin." The branch appears on GitHub.

## Creating a Pull Request (to merge your branch)
1. After pushing a branch, GitHub Desktop shows a banner with "Create Pull Request" — click it, or go to the repository on GitHub.com and click "Compare & pull request."
2. Add a short description of what you changed and why.
3. Click "Create pull request." This lets collaborators review your changes.
4. After review, merge the PR on GitHub (or someone with permissions will merge it). This combines your branch into `main`.

## Handling simple conflicts (overview)
- Sometimes two people change the same lines of a file and Git cannot automatically combine them. This is a merge conflict.
- GitHub Desktop will show conflicted files and let you open them in your editor to resolve the conflict by choosing which changes to keep.
- After resolving, commit the merge and push.

## Keeping your local copy up to date
1. In GitHub Desktop, click "Fetch origin" to check for new changes on GitHub.
2. If there are changes, click "Pull origin" (or the Pull button) to download them into your local repository.

## Useful tips and good habits
- Commit often with clear messages (small, focused commits are easier to review).
- Use branches for features or fixes; keep `main` stable.
- Add a README to explain your project.
- Use .gitignore to keep temporary or secret files out of Git (GitHub Desktop supports adding a .gitignore when creating a repo).

## Working with collaborators
- Use issues to discuss tasks or bugs.
- Use pull requests for code review and discussion before merging.
- Be respectful in reviews and explain changes clearly in PR descriptions.

## Advanced note: The Command Line (CLI)
- Git has a powerful command-line interface (CLI) that many developers use for advanced workflows and automation.
- For beginners, GitHub Desktop provides the most friendly graphical workflow. If you later want to learn the CLI, it helps to understand the commands `git clone`, `git add`, `git commit`, `git push`, `git pull`, and `git merge`.
- The CLI is optional — only use it when you're comfortable and need advanced features.

## Quick reference (Common actions)
- Create a new repo: GitHub Desktop → File → New repository.
- Clone a repo: GitHub Desktop → File → Clone repository.
- Commit changes: write summary → Commit to <branch>.
- Push changes: Push origin.
- Pull changes: Fetch origin → Pull origin.
- Create branch: Branch menu → New branch.
- Create PR: Push branch → Create Pull Request (in Desktop or on GitHub.com).

## Want more help?
- If you'd like, I can add screenshots for GitHub Desktop steps, a short cheat-sheet PDF, or a guided video-style checklist. Tell me which you prefer.

---
*Created for complete beginners — uses GitHub Desktop as the primary workflow. CLI is noted only as an advanced option.*

