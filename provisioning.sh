#!/usr/bin/env bash

# Install Rabbit MQ
# https://gist.github.com/smali-kazmi/b0042d3dbfde64baf665
# echo "deb http://www.rabbitmq.com/debian/ testing main"  | tee  /etc/apt/sources.list.d/rabbitmq.list > /dev/null
echo "deb http://www.rabbitmq.com/debian/ testing main" >> /etc/apt/sources.list
#wget http://www.rabbitmq.com/rabbitmq-signing-key-public.asc
#apt-key add rabbitmq-signing-key-public.asc
curl http://www.rabbitmq.com/rabbitmq-signing-key-public.asc | apt-key add -
apt-get update
apt-get install -y --force-yes rabbitmq-server
service rabbitmq-server start

# Enable Admin interface (port:15672)
rabbitmq-plugins enable rabbitmq_management
# sudo rabbitmq-plugins enable rabbitmq_jsonrpc
# sudo rabbitmq-plugins enable rabbitmq_federation
# sudo rabbitmq-plugins enable rabbitmq_federation_management

# Add admin user and delete default guest user
rabbitmqctl add_user admin password
rabbitmqctl set_user_tags admin administrator
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
rabbitmqctl delete_user guest
# Add batam user and vhost
rabbitmqctl add_user batam batam_pwd
rabbitmqctl add_vhost batam
rabbitmqctl set_permissions -p batam batam ".*" ".*" ".*"

service rabbitmq-server restart
rabbitmq-plugins list

# Install Mongo DB
echo "deb [ arch=amd64 ] http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y --force-yes mongodb-org
sudo service mongod start

# Install NodeJS, NPM
sudo apt-get install -y nodejs
sudo apt-get install -y npm

# nodejs index.js > stdout.log 2> stderr.log &