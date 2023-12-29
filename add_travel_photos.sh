#!/bin/bash

IG_POSTS_DIR=/mnt/c/Users/mdnah/OneDrive/Backups/Instagram/instagram-mdni007-2023-12-27-kYd5DUaI/media/posts
TRAVEL_PHOTOS_DIR=./images/travel

COUNTER=0
find $IG_POSTS_DIR -type f -print0 | while read -d $'\0' photo; 
do
    echo "Converting $photo";
    if [[ $photo == *.mp4 ]]; then
        continue
    fi

    convert $photo -format HEIC \( -background none -pointsize 32 -fill black -strokewidth 2 -stroke black -font arial -gravity center label:"@mdni007" -channel a -evaluate multiply 0.33 +channel \) -gravity center -geometry +0+50 -compose over -composite  $TRAVEL_PHOTOS_DIR/mdni007-$COUNTER.heic;
    echo "$TRAVEL_PHOTOS_DIR/mdni007-$COUNTER.heic";
    let COUNTER++;
done