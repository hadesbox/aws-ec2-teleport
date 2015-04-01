#!/bin/sh

export NODE_PATH=/usr/local/lib/node_modules/teleport/node_modules

node /usr/local/lib/node_modules/teleport/main.js $1 $2 > /tmp/salida

if [ $? -eq 0 ]; then
   ssh -i $(cat salida)
   exit;
else
   cat /tmp/salida
   rm /tmp/salida
   exit;
fi
