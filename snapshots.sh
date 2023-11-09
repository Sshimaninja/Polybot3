#!/bin/bash

output_tar="bor-mainnet-snapshot-2023-11-06.tar.zst"
parts=(bor-mainnet-snapshot-bulk-2023-11-06-part-*)

for ((i=0; i<${#parts[@]}-1; i+=2)); do
    echo "Joining ${parts[i]} and ${parts[i+1]}"
    cat ${parts[i]} ${parts[i+1]} > "$output_tar"

    echo "Verifying the integrity of $output_tar"
    if tar -I zstd -tf "$output_tar" >/dev/null; then
        echo "$output_tar is valid, deleting ${parts[i]} and ${parts[i+1]}"
        rm ${parts[i]} ${parts[i+1]}
    else
        echo "$output_tar is not valid, not deleting parts"
    fi
done