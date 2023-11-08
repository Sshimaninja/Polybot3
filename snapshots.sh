#!/bin/bash

output_tar="bor-mainnet-snapshot-2023-11-06.tar.zst"
echo "Join parts for 2023-11-06"
cat bor-mainnet-snapshot-bulk-2023-11-06-part-* | pv -s $(du -cb bor-mainnet-snapshot-bulk-2023-11-06-part-* | tail -n 1 | cut -f 1) > "$output_tar"

echo "Verify the integrity of $output_tar"
if tar -I zstd -tf "$output_tar" >/dev/null; then
    echo "$output_tar is valid, deleting parts"
    rm bor-mainnet-snapshot-bulk-2023-11-06-part-*
else
    echo "$output_tar is not valid, not deleting parts"
    exit 1
fi

echo "Extracting $output_tar to /var/lib/bor/snapshots"
pv $output_tar | tar -I zstd -xf - -C /var/lib/bor/snapshots