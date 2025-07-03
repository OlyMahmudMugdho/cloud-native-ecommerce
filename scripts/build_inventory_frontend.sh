#!/bin/bash

cd inventory-frontend && \
npm run build && \
cp dist ../inventory-service/cmd -r && \
cd ../