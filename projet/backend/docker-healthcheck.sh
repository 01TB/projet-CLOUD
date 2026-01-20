#!/bin/sh
if curl -f http://localhost:8080/api/health; then
    exit 0
else
    exit 1
fi