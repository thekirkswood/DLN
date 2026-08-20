# 3060 Windows laptop as a Cursor seat

This Cursor on the tower still cannot reach the 3060. That is fine. You do **not** need OpenSSH Server on Windows to *use* Cursor on that laptop.

Cursor’s installer is not OpenSSH. Optional Features is a **Windows** screen, not a Cursor screen.

## What to do on the 3060 (this is the seat)

1. Open the Cursor you installed. Sign in as Ewan.
2. Command Palette (`Ctrl+Shift+P`) → **Remote-SSH: Connect to Host…**
3. Connect to `user@192.168.0.223` (ChoozBoost downstairs).
4. Open `/home/main/DLN` for campus, or `/home/main/ModYu` (that path is a symlink onto the 1TB) for the client house.
5. Honour [`house-lease.md`](house-lease.md) — do not write the same house the tower is already writing.
6. Leave Cursor running; turn sleep off if it should work closed.

That traffic is **outbound** from Windows to Debian. Windows already has an SSH *client* on current Windows 10/11. You are not opening a server on the laptop.

Details: [`cursor-remote-ssh.md`](cursor-remote-ssh.md).

## OpenSSH Server — only if this tower should log *into* the 3060

Skip this unless we need to reach the Windows box from here.

It lives in **Windows**, not Cursor:

- Settings → System → **Optional features** → View features → **OpenSSH Server**
- or Settings → Apps → Optional features → Add a feature
- Search the Start menu for “Manage optional features”

PowerShell **as Administrator**:

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

Allow port 22 on the Private network firewall. Until that is on, this Linux Cursor cannot see the 3060. That does not block you using Cursor *on* the 3060.
