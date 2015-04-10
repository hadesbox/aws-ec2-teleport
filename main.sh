#!/bin/sh

export NODE_PATH=/usr/local/lib/node_modules/teleport/node_modules

node /usr/local/lib/node_modules/teleport/main.js $1 $2 > /tmp/salida

rm /tmp/salida 2>/dev/null

if [ $? -eq 0 ]; then
   ssh -i $(cat /tmp/salida)
   exit;
else
   cat /tmp/salida 2>/dev/null
   rm /tmp/salida 2>/dev/null
   exit;
fi
