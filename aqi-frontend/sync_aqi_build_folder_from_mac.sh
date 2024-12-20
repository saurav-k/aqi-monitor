#!/bin/bash

# Define local and remote paths
LOCAL_FOLDER_PATH="/Users/saurav.kumar/aqi-monitor/aqi-monitor/aqi-frontend/build"  # Replace with the local folder path
REMOTE_USER="ec2-user"
# REMOTE_HOST="98.130.74.124"
REMOTE_HOST="18.60.62.78"
REMOTE_PATH="/home/ec2-user/workdir/aqi-monitor/aqi-frontend/"
SSH_KEY="~/aqi-monitor/aqi-monitor.pem"

# Sync local folder to remote folder
rsync -avz -e "ssh -i ${SSH_KEY}" "$LOCAL_FOLDER_PATH" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}

# Print completion message
echo "Sync completed successfully to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
