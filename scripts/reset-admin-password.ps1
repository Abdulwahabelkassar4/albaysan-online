$ApiUrl = "https://albaysan-online.onrender.com"
$Username = "AlbilsanOwner12231475"
$SetupToken = "" # Optional: paste ADMIN_SETUP_TOKEN here, or leave empty to be prompted
$NewPassword = "" # Required: set your new password here

if ([string]::IsNullOrWhiteSpace($NewPassword)) {
  $NewPassword = Read-Host "Enter new admin password"
}

if ([string]::IsNullOrWhiteSpace($SetupToken)) {
  $SetupToken = Read-Host "Enter ADMIN_SETUP_TOKEN"
}

if ([string]::IsNullOrWhiteSpace($NewPassword)) {
  Write-Error "Missing new password. Provide `$NewPassword or enter it when prompted."
  exit 1
}

if ([string]::IsNullOrWhiteSpace($SetupToken)) {
  Write-Error "Missing setup token. Provide `$SetupToken or enter it when prompted."
  exit 1
}

$uri = "$ApiUrl/api/admin/reset-password"
$headers = @{
  "Content-Type" = "application/json"
  "x-setup-token" = $SetupToken
}
$body = @{
  username = $Username
  password = $NewPassword
} | ConvertTo-Json

try {
  $response = Invoke-RestMethod -Method POST -Uri $uri -Headers $headers -Body $body
  Write-Host "Password updated successfully for user: $Username" -ForegroundColor Green
  $response | ConvertTo-Json -Depth 5
  exit 0
}
catch {
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Error "Request failed: $errorBody"
  }
  else {
    Write-Error $_.Exception.Message
  }
  exit 1
}
