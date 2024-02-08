# Script to convert Chuck examples directory to JSON of paths
import os
import json
import re

# TODO: Mini Audicle examples path here
CHUCK_EXAMPLES_PATH= "/Users/terryfeng/Documents/research/chuck/chuck/examples"
OUTPUT_JSON_FILE = "../public/examples/moreExamples.json"

# Chuck examples Web URL
EXAMPLES_WEB_URL = 'https://raw.githubusercontent.com/ccrma/chuck/main/examples'

# Exclude directories
excludeDirs = ["book", "kbhit", "word2vec"]

# IMPORTANT: Exclude examples containing the words, features not compatible with WebChucK
excludeFileWords = ["OscIn", "OscOut", "Hid", "HidMsg", "MidiIn", "MidiOut", "MidiMsg", "MidiFileIn", "ConsoleInput", "WvOut"]
# Exclude Chugins
chugins_list = [ "ABSaturator", "Bitcrusher", "Elliptic", "Faust", "FIR", "FoldbackSaturator", "GVerb", "KasFilter", "MagicSine", "Pan4", "Pan8", "Pan16", "PitchTrack", "Mesh2D", "MIAP", "PowerADSR", "Spectacle", "WarpBuf", "WinFuncEnv" ]
excludeFileWords += chugins_list
# add a space to the end of each word to match Object classes
excludeFileWords = [word + " " for word in excludeFileWords]
excludeFileWords += ["SerialIO", "Serial", "gtzan", "otf_0"]

# Exclude files
excludeFilenames = ["feature-extract.ck", "write.ck", "Dyno-limit.ck", "Dyno-duck.ck"]

# Examples Dictionary
examplesDict = {}
fileCount = 0
dirCount = 0

def filterChuckExample(f, fileText):
    if f in excludeFilenames:
        return False
    # Filter out examples that have certain disabled features
    for word in excludeFileWords:
        if word in fileText:
            return False

    return True

# regex to find "*.wav" or "*.txt" strings in chuckExample
def extract_quoted_file_instances(text, extensions):
    pattern = fr'\"(\S*({"|".join(map(re.escape, extensions))})\S*)\"'
    matches = re.findall(pattern, text)
    return [match[0] for match in matches]

# Process chuckExample to only file names
# e.g. "data/file.txt" to "file.txt"
def processChuckExample(chuckExample, file_paths):
    for folder in file_paths:
        chuckExample = chuckExample.replace(folder, os.path.basename(folder))
    return chuckExample

# convert file paths to relative URL
# e.g. "data/file.txt" to "https://raw.githubusercontent.com/ccrma/chuck/main/examples/data"
# e.g. "../data/file.txt" to "https://raw.githubusercontent.com/ccrma/chuck/main/examples/data"
def convertedToURL(relativeRoot, file_paths):
    url_paths = []
    for folder in file_paths:
        # remove "../" from folder
        while (folder.startswith("../")):
            folder = folder[3:]
            relativeRoot = os.path.dirname(relativeRoot)
        newPath = os.path.join(relativeRoot, folder)
        # make sure path starts with "/"
        if (newPath[0] != "/"):
            newPath = "/" + newPath
        
        url_paths.append(EXAMPLES_WEB_URL + newPath)
    
    return list(set(url_paths))


# get data files from chuckExample
# me.dir() etc.. => parse into a url
def checkChuckExample(chuckExample, relativeRoot, f):
    # Check if the chuckExample string contains a .wav or .txt as a string
    if (".wav" in chuckExample or ".txt" in chuckExample):
        # If there is a .wav or .txt file, convert the file paths
        # get the string containing the file path "data/file.txt"
        file_paths = extract_quoted_file_instances(chuckExample, [".wav", ".txt"])
        if (len(file_paths) == 0):
            return chuckExample, []

        # Change file paths to only file names in chuckExample
        chuckExample = processChuckExample(chuckExample, file_paths)
        
        # Process to data files
        url_paths = convertedToURL(relativeRoot, file_paths)
    
        return chuckExample, url_paths

    return chuckExample, []
    
if __name__ == "__main__":

    # Get all files in directory
    for (root, dirs, file) in os.walk(CHUCK_EXAMPLES_PATH):
        # Root, pop off the folder name
        parentDir = root.split("/")[-1]
        # Root, get relative to CHUCK_EXAMPLES_PATH
        relativeRoot = root.split(CHUCK_EXAMPLES_PATH)[1]
        # exclude directories 
        dirs[:] = [d for d in dirs if d not in excludeDirs]

        # Process files in directory
        for f in file:
            if (f.endswith(".ck")):
                # read the file
                with open(os.path.join(root, f), "r") as exampleFile:
                    chuckExample = exampleFile.read()

                    if (filterChuckExample(f, chuckExample)):
                        chuckExample, data_urls = checkChuckExample(chuckExample, relativeRoot, f)
                        if (parentDir in examplesDict):
                            # read chuckExample again and convert file paths
                            examplesDict[parentDir].append({
                                f: {
                                    "name": f,
                                    "code": chuckExample,
                                    "data": data_urls
                                }
                            })
                        else:
                            examplesDict[parentDir] = [{
                                f: {
                                    "name": f,
                                    "code": chuckExample,
                                    "data": data_urls
                                }
                            }]

                        fileCount += 1

    # folder with no chuck files, only subfolders
    examplesDict["ai"] = []

    # Get all subdirectories
    for (root, dirs, file) in os.walk(CHUCK_EXAMPLES_PATH):
        # Root, pop off the folder name
        parentDir = root.split("/")[-1]
        # exclude directories 
        dirs[:] = [d for d in dirs if d not in excludeDirs]

        # add directories
        for d in dirs:
            if (d in examplesDict):
                examplesDict[parentDir].append(d)
                dirCount += 1



    print("Chuck examples converted:", fileCount)
    print("Chuck subfolders added:", dirCount)

    # dict to json
    examplesJSON = json.dumps(examplesDict, indent = 4)

    # Write to file
    with open(OUTPUT_JSON_FILE, "w") as outfile:
        outfile.write(examplesJSON)
        print("JSON file written to:", OUTPUT_JSON_FILE)
