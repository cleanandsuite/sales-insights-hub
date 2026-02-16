$req = [System.Net.FtpWebRequest]::Create("ftp://ftp.fourdiagrams.com/assets/")
$req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$req.Credentials = New-Object System.Net.NetworkCredential("admin@sevend9.com", "P@nouchee02")
$resp = $req.GetResponse()
$stream = $resp.GetResponseStream()
$reader = New-Object System.IO.StreamReader($stream)
Write-Host $reader.ReadToEnd()
$reader.Close()
$resp.Close()
