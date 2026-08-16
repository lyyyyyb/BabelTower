Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
nodePath = fso.BuildPath(root, "portable-node\node.exe")
If Not fso.FileExists(nodePath) Then nodePath = "node"
serverPath = fso.BuildPath(root, "core\bridge_server.js")

sh.CurrentDirectory = root
sh.Run """" & nodePath & """ """ & serverPath & """", 0, False
