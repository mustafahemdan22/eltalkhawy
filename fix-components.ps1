$dir = 'd:\next-react\eltalkhawy\components'
$files = Get-ChildItem -Path $dir -Recurse -Filter '*.tsx'

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    
    $c = $c -replace 'text-charcoal-300', 'text-secondary'
    $c = $c -replace 'text-charcoal-400', 'text-muted'
    $c = $c -replace 'text-charcoal-200', 'text-secondary'
    $c = $c -replace 'text-cream-100', 'text-primary'
    $c = $c -replace 'text-cream-200/80', 'text-secondary'
    $c = $c -replace 'text-cream-200/70', 'text-secondary'
    $c = $c -replace 'text-cream-200', 'text-primary'
    
    $c = $c -replace 'bg-charcoal-900/60', 'bg-surface'
    $c = $c -replace 'bg-charcoal-900/30', 'bg-surface/30'
    $c = $c -replace 'bg-charcoal-900', 'bg-surface'
    $c = $c -replace 'bg-charcoal-950/40', 'bg-surface-raised/40'
    $c = $c -replace 'bg-charcoal-950/50', 'bg-surface-raised/50'
    $c = $c -replace 'bg-charcoal-950/60', 'bg-surface-raised/60'
    $c = $c -replace 'bg-charcoal-950/80', 'bg-surface-raised/80'
    $c = $c -replace 'bg-charcoal-950', 'bg-base'
    
    $c = $c -replace 'bg-charcoal-800/90', 'bg-surface-raised/90'
    $c = $c -replace 'bg-charcoal-800/60', 'bg-surface-raised/60'
    $c = $c -replace 'bg-charcoal-800/30', 'bg-surface/30'
    $c = $c -replace 'bg-charcoal-800/40', 'bg-surface/40'
    $c = $c -replace 'bg-charcoal-800', 'bg-surface-raised'
    
    $c = $c -replace 'bg-charcoal-700', 'bg-surface-raised/80'
    $c = $c -replace 'bg-charcoal-600', 'bg-surface-raised/50'

    $c = $c -replace 'border-charcoal-900/30', 'border-muted/30'
    $c = $c -replace 'border-charcoal-900', 'border-muted'
    $c = $c -replace 'border-charcoal-800/80', 'border-muted/80'
    $c = $c -replace 'border-charcoal-800', 'border-muted'
    $c = $c -replace 'border-charcoal-700', 'border-muted'
    $c = $c -replace 'border-charcoal-600/50', 'border-muted/50'
    $c = $c -replace 'border-charcoal-600', 'border-muted'
    $c = $c -replace 'border-charcoal-500', 'border-muted'
    $c = $c -replace 'border-charcoal-400', 'border-muted'
    
    $c = $c -replace 'hover:border-charcoal-500', 'hover:border-muted'
    $c = $c -replace 'hover:border-charcoal-400', 'hover:border-muted'
    $c = $c -replace 'group-hover:border-charcoal-400', 'group-hover:border-muted'
    
    $c = $c -replace 'hover:bg-charcoal-800/40', 'hover:bg-surface-raised/40'
    $c = $c -replace 'hover:bg-charcoal-800/30', 'hover:bg-surface-raised/30'
    $c = $c -replace 'hover:bg-charcoal-700', 'hover:bg-surface-raised/80'
    $c = $c -replace 'hover:bg-charcoal-600', 'hover:bg-surface-raised/50'
    
    $c = $c -replace 'hover:text-cream-200', 'hover:text-primary'
    $c = $c -replace 'hover:text-cream-100', 'hover:text-primary'

    [System.IO.File]::WriteAllText($f.FullName, $c)
}
Write-Output 'Done'
