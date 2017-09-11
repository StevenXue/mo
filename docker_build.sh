#!/usr/bin/env bash
cd /Users/zhaofengli/Documents/goldersgreen/goldersgreen
docker build -t model_app:v1 .
docker save model_app:v1 | bzip2 | pv | ssh docker@192.168.65.2 'cat | docker load'