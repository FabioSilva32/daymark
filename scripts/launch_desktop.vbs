Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\itzfa\Desktop\The Everything App"
WshShell.Run "npm run desktop", 0, False
