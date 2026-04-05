# Pull unrelated already pushed files (prevent push error)
# git pull origin main --allow-unrelated-histories


# Push to main
git push --set-upstream origin main


# 내 로컬 기준으로 막아주는 force push 형식
# git push --force-with-lease origin main

# force overwrite
# git push -f origin main