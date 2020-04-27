#!/bin/bash
###############################################################
# Author: EvilSpark
# License: GPL V3
###############################################################
# Script to automatically patch Vivaldi browser UI in Linux
# Snapshot -  Tested on Vivaldi	3.0.1874.27 (Official Build) (64-bit)
# Stable - Vivaldi	3.0.1874.23 (Stable channel) (64-bit)
###############################################################
currentDir='/home/evilspark/Codes/VivaldiAutoMod'

function checkRoot() {
    if [ $UID -ne 0 ]; then
        echo "This script must be run as superuser"
        sudo $0 #Runs itself as root
        exit 0
    fi
}
function checkVivaldiInstalled() {
    vivaldiInstallations=$(find /opt -name vivaldi-bin)
    vivaldiInstallationsCount=$(echo $vivaldiInstallations | wc -w)
    if [ $vivaldiInstallationsCount -eq 0 ]; then
        echo "Could not find any Vivaldi installation"
        exit 1
    fi
}
function checkModFoldersPresent() {
   if ! [ -f hooks.js ]; then
        echo "Could not find file 'hooks.js'"
        exit 1
    fi
    
}
function selectVivaldiInstallation() {
    vivaldiInstallationsFolders=($(dirname $vivaldiInstallations))
    if [ $vivaldiInstallationsCount -gt 1 ]; then
        option=0
        while [ $option -le 0 ] || [ $option -gt $vivaldiInstallationsCount ]; do 
            echo "Pick Vivaldi installation to patch"
            i=1
            for vivaldiInstallationsFolder in ${vivaldiInstallationsFolders[@]}; do
                echo "$((i++))) $vivaldiInstallationsFolder"
            done
            echo "$i) Cancel"
            read option
            #This block transforms input into an invalid option to avoid breaking the script if we enter a letter or a symbol
            if [[ $(echo $option | egrep '\b[0-9]{1,2}\b') = '' ]]; then
                option=0
            fi
            #If we choose to cancel we get in here
            if [ $option -eq $i ]; then
                exit 0
            fi
        done
        targetDir=${vivaldiInstallationsFolders[--option]}
       
        # the -- operator is to pick correct array index
    else
        targetDir=${vivaldiInstallationsFolders[0]}
    fi
}
function patchVivaldi() {
    alreadyPatched=$(grep "hooks.js" $targetDir/resources/vivaldi/browser.html);
    if [[ $alreadyPatched == '' ]]; then
        #Backup current browser.html
        cp $targetDir/resources/vivaldi/browser.html $targetDir/resources/vivaldi/browser-$(date +%Y-%m-%dT%H-%M-%S).html
        
        #Copy mod files
                cp browser.html $targetDir/resources/vivaldi/
                cp hooks.js $targetDir/resources/vivaldi/
                cp -r $currentDir/hooks $targetDir/resources/vivaldi/
                

        #Patch browser.html
        #sed 29 -e 's/<\/body>/  <script src="hooks.js"><\/script>\n  <\/body>/' "$targetDir/resources/vivaldi/browser.html"

        echo -e "\nVivaldi patched successfully!"
    else
        echo "This Vivaldi installation is already patched"
    fi
}

checkRoot
checkVivaldiInstalled
checkModFoldersPresent
selectVivaldiInstallation
patchVivaldi
