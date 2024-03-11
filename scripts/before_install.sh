#!/bin/bash
sudo apt-get install python-software-properties -y
sudo apt-add-repository ppa:chris-lea/node.js -y
sudo apt-get update
sudo apt-get install nodejs -y

sudo npm i pm2 -g
