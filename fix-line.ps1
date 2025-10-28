$content = Get-Content 'src\components\LotWiseTable.tsx'
$content[450] = "                  {tenderType === 'Goods' && evaluationMethodology !== 'Lot-wise' && ("
$content | Set-Content 'src\components\LotWiseTable.tsx'

