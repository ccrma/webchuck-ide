#!/bin/bash

# Generate gif from demo video files
# Usage: bash generate_gif.sh
# Note: This script requires ffmpeg to be installed

PALETTE_FILENAME="palette.png"
FPS=30
WIDTH=1280

for file in *.{mov,mp4}; do
    if [[ -f "$file" ]]; then
        echo "Processing ${file} ..."
        ffmpeg -i ${file} \
            -vf "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,palettegen" \
            ${PALETTE_FILENAME}
        ffmpeg -i ${file} -i ${PALETTE_FILENAME} \
            -filter_complex "[0:v] fps=30,scale=1280:-1:flags=lanczos [x]; [x][1:v] paletteuse" \
            ${file%????}.gif
        rm ${PALETTE_FILENAME}
        echo "Processing ${file} done!"
    fi
done
