#!/bin/bash

tags=("latest" "alpha")

if [[ ! " ${tags[@]} " =~ " $1 " ]]; then
  echo "Invalid tag: $1"
  exit 1
fi

declare -a arr=("api" "app" "artisan" "stitcher")

dir=$(pwd)

for package in "${arr[@]}"
do
   cd $dir/../apps/$package
   echo "👷 Building $package"
   TAG=$1 pnpm run build
   docker build . --no-cache --platform linux/amd64,linux/arm64 --tag=superstreamerapp/$package:$1
done