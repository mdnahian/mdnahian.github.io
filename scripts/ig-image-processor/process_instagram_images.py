#!/usr/bin/env python3

import os
import json
import sys
import tarfile
import tempfile
import shutil
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

# Constants
OUTPUT_DIR = "images"
WATERMARK_TEXT = "@mdni007"

def create_output_directory():
    """Create output directory if it doesn't exist"""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    else:
        # Clean the directory
        for file in os.listdir(OUTPUT_DIR):
            os.remove(os.path.join(OUTPUT_DIR, file))

def is_image_file(filename):
    """Check if file is an image based on extension"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'}
    return any(filename.lower().endswith(ext) for ext in image_extensions)

def add_watermark(image_path, output_path):
    """Add watermark to the center of the image"""
    try:
        with Image.open(image_path) as img:
            # Create a copy of the image
            watermarked = img.copy()
            
            # Create drawing context
            draw = ImageDraw.Draw(watermarked)
            
            # Calculate font size based on image size - reduced to 3% of smallest dimension
            font_size = int(min(img.size) * 0.03)  # 3% of smallest dimension
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                # Fallback to default font
                font = ImageFont.load_default()
            
            # Get text size
            text_bbox = draw.textbbox((0, 0), WATERMARK_TEXT, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            # Calculate center position
            x = (img.width - text_width) // 2
            y = (img.height - text_height) // 2
            
            # Add semi-transparent watermark
            draw.text((x, y), WATERMARK_TEXT, font=font, fill=(255, 255, 255, 128))
            
            # Save the watermarked image
            watermarked.save(output_path, "JPEG")
            print(f"Successfully processed: {os.path.basename(image_path)} -> {os.path.basename(output_path)}")
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")

def load_timestamps(backup_dir):
    """Load timestamps from Instagram metadata JSON files"""
    timestamps = {}
    json_files = [
        os.path.join(backup_dir, "your_instagram_activity/media/posts_1.json"),
        os.path.join(backup_dir, "your_instagram_activity/media/stories.json"),
        os.path.join(backup_dir, "your_instagram_activity/media/profile_photos.json")
    ]
    
    for json_file in json_files:
        if os.path.exists(json_file):
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    for post in data:
                        if 'media' in post:
                            for media in post['media']:
                                if 'uri' in media and 'creation_timestamp' in media:
                                    # Extract filename from uri
                                    filename = os.path.basename(media['uri'])
                                    timestamps[filename] = media['creation_timestamp']
            except Exception as e:
                print(f"Error reading {json_file}: {str(e)}")
    
    return timestamps

def process_media(backup_dir):
    """Process all images from Instagram backup"""
    create_output_directory()
    
    # Load timestamps from metadata
    timestamps = load_timestamps(backup_dir)
    
    # Path to media folder in Instagram backup
    media_folder = os.path.join(backup_dir, "media")
    
    if not os.path.exists(media_folder):
        print(f"Error: Media folder not found in {backup_dir}")
        return
    
    # Process images from posts, stories, and profile directories
    for subdir in ['posts', 'stories', 'profile']:
        subdir_path = os.path.join(media_folder, subdir)
        if not os.path.exists(subdir_path):
            continue
            
        # Walk through all subdirectories
        for root, dirs, files in os.walk(subdir_path):
            for filename in files:
                if is_image_file(filename):
                    file_path = os.path.join(root, filename)
                    
                    # Get timestamp from metadata or fallback to file creation time
                    timestamp = timestamps.get(filename, os.path.getctime(file_path))
                    date_str = datetime.fromtimestamp(timestamp).strftime('%Y%m%d_%H%M%S')
                    
                    # Determine output filename and path
                    output_filename = f"{date_str}.jpg"
                    output_path = os.path.join(OUTPUT_DIR, output_filename)
                    
                    # If file already exists, append a counter
                    counter = 1
                    while os.path.exists(output_path):
                        output_filename = f"{date_str}_{counter}.jpg"
                        output_path = os.path.join(OUTPUT_DIR, output_filename)
                        counter += 1
                    
                    add_watermark(file_path, output_path)

def extract_backup(tar_path):
    """Extract Instagram backup tar file to a temporary directory"""
    try:
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Extract the tar file
        with tarfile.open(tar_path, 'r:*') as tar:
            def is_within_limits(member):
                # Prevent extraction of files with absolute paths or parent directory references
                return not os.path.isabs(member.name) and '..' not in member.name
            
            # Extract all files that pass the safety check
            members = [member for member in tar.getmembers() if is_within_limits(member)]
            tar.extractall(temp_dir, members=members)
        
        # Find the Instagram backup directory
        backup_dir = None
        for item in os.listdir(temp_dir):
            if item.startswith('instagram-'):
                backup_dir = os.path.join(temp_dir, item)
                break
        
        if not backup_dir:
            raise Exception("Instagram backup directory not found in the tar file")
        
        return temp_dir, backup_dir
    except Exception as e:
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise e

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 process_instagram_images.py <instagram_backup.tar>")
        sys.exit(1)
    
    tar_path = sys.argv[1]
    if not os.path.exists(tar_path):
        print(f"Error: File not found: {tar_path}")
        sys.exit(1)
    
    temp_dir = None
    try:
        # Extract the backup
        temp_dir, backup_dir = extract_backup(tar_path)
        
        # Process the images
        process_media(backup_dir)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        # Clean up temporary directory
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main() 