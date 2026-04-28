# Bravo_Project
Introduction: CSIT314 Group Assignment Project Repository. Semi Final Year Project(FYP), before actual FYP.
Duration: Apr 4th, 2026 ~ May 18th, 2026 (Estimated)

# Team member
- Juwon
- Zi Lin
- May
- Kiefer
- Carissa
- Lynette

# How to run
```nvm install 20 && nvm use 20 && npm run dev```
- requires node version 20 or more

# Github branch work
- for every user story, use feature/{user_story_shortened} naming.
- Branch creation steps
```
git switch dev
git pull origin dev
git switch -c feature/something
```
all development branches should be under dev
- Manage and Update branch commands
```git
# 1. After one work
git add .
git commit -m "feat: basic frontend setup"

# 2. push to github website
git push -u origin feature/basic_frontend

# 3. Later
Merge to main on Github website
```


Other useful Commands
```git log --oneline --graph --all``` check push history and branch logs

# Links
Team Bravo Notion Link: 
https://www.notion.so/CSIT314-Bravo-3363e76457e7809bade0ddfea4310978

Taiga Platform for Agile Development:
https://tree.taiga.io/

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
