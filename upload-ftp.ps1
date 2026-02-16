# FTP Upload Script for SellSig - Using FtpWebRequest with Passive Mode

$ftpServer = "ftp.fourdiagrams.com"
$ftpUser = "admin@sevend9.com"
$ftpPass = "P@nouchee02"
$remotePath = "/public_html/sevend9.com/"
$localDistPath = "C:\.openclaw\workspace\sales-insights-hub-new\dist"

function Upload-File {
    param(
        [string]$localFile,
        [string]$remoteFile
    )
    
    $req = [System.Net.FtpWebRequest]::Create($remoteFile)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $req.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $req.UsePassive = $true
    $req.UseBinary = $true
    
    try {
        $fileContents = [System.IO.File]::ReadAllBytes($localFile)
        $stream = $req.GetRequestStream()
        $stream.Write($fileContents, 0, $fileContents.Length)
        $stream.Close()
        
        $response = $req.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        Write-Host "  Error: $_"
        return $false
    }
}

function Create-Directory {
    param([string]$remoteDir)
    
    $req = [System.Net.FtpWebRequest]::Create($remoteDir)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $req.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $req.UsePassive = $true
    
    try {
        $response = $req.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Upload-FtpDirectory {
    param(
        [string]$localDir,
        [string]$remoteDir
    )
    
    # Upload files
    Get-ChildItem -Path $localDir -File | ForEach-Object {
        $fileName = $_.Name
        $remoteUri = "ftp://$ftpServer$remoteDir$fileName"
        
        Write-Host "Uploading: $fileName..."
        if (Upload-File -localFile $_.FullName -remoteFile $remoteUri) {
            Write-Host "  Success: $fileName"
        }
    }
    
    # Upload subdirectories
    Get-ChildItem -Path $localDir -Directory | ForEach-Object {
        $subDir = $_.Name
        $newRemoteDir = $remoteDir + $subDir + "/"
        
        Write-Host "Creating directory: $subDir..."
        $mkdirResult = Create-Directory -remoteDir "ftp://$ftpServer$newRemoteDir"
        
        # Recursively upload
        Upload-FtpDirectory -localDir $_.FullName -remoteDir $newRemoteDir
    }
}

Write-Host "Starting FTP upload to $ftpServer$remotePath"
Write-Host "=============================================="

Upload-FtpDirectory -localDir $localDistPath -remoteDir $remotePath

Write-Host "=============================================="
Write-Host "Upload complete!"
Write-Host "Site should be available at: https://sevend9.com"
