#!/bin/bash

tags=("latest" "alpha")

if [[ ! " ${tags[@]} " =~ " $1 " ]]; then
  echo "Invalid tag: $1"
  exit 1
fi

declare -a arr=("api" "app" "artisan" "stitcher")

for package in "${arr[@]}"
do
   docker push superstreamerapp/$package:$1
   echo "✅ Published $package"
done
