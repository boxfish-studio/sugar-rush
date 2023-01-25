#!/bin/bash
tag=$(git describe --abbrev=0)
echo "{\"version\":\"${tag}\"}" > version.json
