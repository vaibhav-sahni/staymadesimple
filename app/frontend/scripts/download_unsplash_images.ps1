# PowerShell script to download three Unsplash images into app/frontend/public/images
# Usage: run from repository root in PowerShell: .\app\frontend\scripts\download_unsplash_images.ps1

$outDir = "app/frontend/public/images"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$unsplashIds = @(
  'nmKPgfIUYtM', # living room
  'umAXneH4GhA', # bed frame
  'hlOpCML8twI'  # sectional sofa
)

# set a common browser user-agent to avoid Unsplash blocking non-browser clients
$headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36' }

$i = 1
foreach ($id in $unsplashIds) {
  $url = "https://source.unsplash.com/$id/1600x900"
  $out = "${outDir}\unsplash${i}.jpg"
  Write-Host "Downloading $url -> $out"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -Headers $headers -MaximumRedirection 10 -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Warning ("Failed to download {0}: {1}" -f $url, $_)
  }
  $i++
}

Write-Host "Done. Images saved to $outDir"
