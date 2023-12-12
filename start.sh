#!/bin/bash

install_xvfb() {
    if [ -f "/etc/os-release" ]; then
        . /etc/os-release
        OS=$NAME
    else
        echo "Cannot detect the operating system."
        exit 1
    fi

    case $OS in
        "CentOS Linux")
            sudo yum install -y xvfb
            ;;
        "Ubuntu")
            sudo apt-get update
            sudo apt-get install -y xvfb
            ;;
        *)
            echo "Unsupported OS. Please install xvfb manually."
            exit 1
            ;;
    esac
}

which xvfb-run &> /dev/null
if [ $? -ne 0 ]; then
    echo "xvfb not found. Installing..."
    install_xvfb
fi

# Function to find an available display number
find_free_display() {
    local display_num=1
    while true; do
        if ! lsof -i :$(($display_num + 6000)) &> /dev/null; then
            echo $display_num
            break
        fi
        ((display_num++))
    done
}

# Find an available display number
DISPLAY_NUM=$(find_free_display)

# Start Xvfb on the found display number
Xvfb :$DISPLAY_NUM -screen 0 1024x768x24 &

# Export the DISPLAY variable
export DISPLAY=:$DISPLAY_NUM

# Run your command
node index.js

# Cleanup: Stop the Xvfb server after the job is done
kill $(pgrep -f "Xvfb :$DISPLAY_NUM")