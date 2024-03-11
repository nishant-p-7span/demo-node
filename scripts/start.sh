#!/bin/bash

cd /home/ubuntu/demo-node
pm2 delete app.js
pm2 start app.js
