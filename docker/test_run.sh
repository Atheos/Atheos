#!/bin/bash

NAME=atest

# exit on failure
set -e
cd ..
# create an image
podman build -t ${NAME} -f docker/Dockerfile .
# run a container from image with PHP-FPM inside
podman run  -d -p 8080:8080 --name ${NAME}-inst ${NAME}
# run nginx in daemonless mode and then kill container root
podman exec -it ${NAME}-inst /bin/sh -c 'nginx'
# stop container
podman stop ${NAME}-inst
# remove container
podman rm ${NAME}-inst
# remove image (this makes next run slower)
# podman rmi ${NAME}
