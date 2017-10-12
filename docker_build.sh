#!/usr/bin/env bash
# $1: images number
# $2: cluster ip
cluster_ip=$2
case "$1" in
"model")
    image=model_app
    dockerfile=Dockerfile_model
    ;;
"jupyter")
    image=jupyter_app
    dockerfile=Dockerfile_jupyter
    ;;
"serving")
    image=serving_app
    dockerfile=Dockerfile_serving
    ;;
*)
    echo "Invalid first arg!"
    exit
esac

cd /Users/zhaofengli/Documents/goldersgreen/goldersgreen
docker build -f ${dockerfile} -t ${image} .
docker save ${image} | bzip2 | pv | ssh root@${cluster_ip} 'cat | docker load'