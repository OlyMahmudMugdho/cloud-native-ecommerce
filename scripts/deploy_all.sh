#!/bin/bash

nohup ./install_linux_packages.sh > install.log 2>&1 &
cd ../infrastructure
./reset_tf.sh
./run.sh
cd ../ansible
./run1.sh
./run2.sh
./run3.sh
./run4.sh