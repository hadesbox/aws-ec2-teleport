#!/bin/sh

export NODE_PATH=/usr/local/lib/node_modules/teleport/node_modules

rm /tmp/salida 2>/dev/null

node /usr/local/lib/node_modules/teleport/main.js $1 $2 > /tmp/salida

if [ $? -eq 0 ]; then
   ssh -i $(cat /tmp/salida)
   exit;
else
   cat /tmp/salida 2>/dev/null
   rm /tmp/salida 2>/dev/null
   exit;
fi
