
aria2c -x6 -s6 --max-tries=0 --save-session-interval=60 --save-session=bor-mainnet-failures.txt --max-connection-per-server=4 --retry-wait=3 --check-integrity=false -i bor-mainnet-parts.txt
