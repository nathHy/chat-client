#!/bin/bash


# VARIABLES
APPLICATION_FOLDER='/home/vagrant/chat-client'

echo "Beginning provisioning of Chat Server"

echo "Configuring Node"

curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
sudo apt-get install -y nodejs
echo "Node installed and configured"

echo "Configuring Mongo DB"
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list 
sudo apt-get update 
sudo apt-get install -y mongodb-org
echo "Mongo installed and configured"

cd $APPLICATION_FOLDER
npm install
npm install --global gulp

# pm2 processes.json start

echo "End of provision script"
sleep 3