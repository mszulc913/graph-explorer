#!/bin/bash

if [ -f /staging/dbtropes.nt ]
then 
    echo 'Dbtropes data already downloaded.'
else
    echo 'Dbtropes data not found. Downloading...'
    wget -O dbtropes.zip http://dbtropes.org/static/dbtropes.zip
    unzip /staging/dbtropes.zip
    rm dbtropes.zip stat*
    mv dbtropes.nt /staging/dbtropes.nt

    echo 'Removing broken statement in the dbtropes input file...'
    sed -i '18012846d' /staging/dbtropes.nt
fi

if [ -f /staging/linkedmdb.nt ]
then 
    echo 'Linkedmdb data already downloaded.'
else
    echo 'Linkedmdb data not found. Downloading...'
    wget -O /staging/linkedmdb.nt https://query.data.world/s/n5acuyvz4gmvjguqidnz6jjuhjewdn
fi

echo 'Loading dbtropes database'
./load.sh dbtropes /staging/dbtropes.nt

echo 'Loading linkedmdb database'
./load.sh linkedmdb /staging/linkedmdb.nt