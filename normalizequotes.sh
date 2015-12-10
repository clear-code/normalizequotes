#!/bin/sh

appname=${0##*/}
appname=${appname%.sh}

cp makexpi/makexpi.sh ./
./makexpi.sh -n $appname -v
rm makexpi.sh
