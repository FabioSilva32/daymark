$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Daymark.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item -Force $shortcutPath
}

$appDir = "C:\Users\itzfa\Desktop\The Everything App"
$vbsPath = Join-Path $appDir "scripts\launch_desktop.vbs"
$icoPath = Join-Path $appDir "public\daymark.ico"

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $appDir
$shortcut.IconLocation = "$icoPath,0"
$shortcut.Description = "Daymark - Personal Command Centre"
$shortcut.Save()

Write-Host "SUCCESS: Shortcut created at: $shortcutPath"
Write-Host "Target: $($shortcut.TargetPath)"
Write-Host "Arguments: $($shortcut.Arguments)"
Write-Host "IconLocation: $($shortcut.IconLocation)"
