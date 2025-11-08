#!/bin/bash

mkdir -p ~/.ssh
mkdir -p ~/.aws
mkdir -p ~/.fast-note/.kube
mkdir -p ~/.fast-note/.config/helm
mkdir -p ~/.fast-note/.claude

DOCKER_NETWORK=br-fast-note-${USER}
NETWORK_EXISTS=$(docker network ls --filter name=$DOCKER_NETWORK --format '{{.Name}}')

if [ -z "$NETWORK_EXISTS" ]; then
  docker network create $DOCKER_NETWORK
fi