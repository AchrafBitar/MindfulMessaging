@echo off
echo Building Mindful Messaging Extension...

REM Build the extension
pnpm build

REM Copy manifest and icons to dist
copy manifest.json dist\manifest.json
xcopy icons dist\icons /E /I

echo Build complete! Extension is ready in the dist folder.
echo You can now load it in Chrome from chrome://extensions/
pause
