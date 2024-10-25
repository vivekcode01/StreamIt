#!/bin/bash

tags=("latest" "alpha")

if [[ ! " ${tags[@]} " =~ " $1 " ]]; then
  echo "Invalid tag: $1"
  exit 1
fi

declare -a arr=("api" "artisan" "app" "stitcher")

dir=$(pwd)

for package in "${arr[@]}"
do
   cd $dir/packages/$package
   echo "👷 Building $package"
   pnpm run build
   docker build . --no-cache --platform linux/amd64,linux/arm64 --tag=superstreamerapp/$package:$1
done