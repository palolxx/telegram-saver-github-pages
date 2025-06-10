@echo off
cd /d "d:\User\Work\SideProjects\TelegramSaver"
git add .
git config --local user.email "user@example.com"
git config --local user.name "User"
git commit -m "Initial commit"
echo Git commit complete
pause
