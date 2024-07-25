# Generate all CKDoc documentation for Monaco Editor
#
# Steps TODO:
#   1. Get the latest CKDOC gen-all.ck script and generate json documentation
#       Link: https://github.com/ccrma/chuck/blob/main/src/scripts/ckdoc/gen-all.ck
#       - Uncomment line 166 to generate json format
#       - Change line 169 to put everything in `./json` folder
#   2. Run the ckdoc generator with `chuck gen-all.ck`
#   3. Run this script `python convertDocumentation.py`
#
# written 7/17/2024 
# terry feng - tzfeng@ccrma.stanford.edu

import json

# where the final ckdoc is outputted!!!
OUTPUT_FILE_PATH = "../src/components/monaco/ckdoc.json"

file_dir = "./json/"
files = [
    'base.json',
    'ugens-basic.json',
    'ugens-filters.json',
    'ugens-stk.json',
    'ugens-advanced.json',
    'uanae.json',
    'ai.json',
    'io.json',
    'utils.json',
    'chugins.json'
]

CKDOC_URL = 'https://chuck.stanford.edu/doc/reference/'

# function to build string of arguments
def argumentString(argArray):
    if (len(argArray) == 0):
        return ""

    argString = ""
    for arg in argArray:
        argString += f"{arg['type']} {arg['name']}, "
    return argString[:-2]

# function convert ckdoc json to hover documentation format
def convertToHoverDoc(obj):
    entry = {}
    # title
    entry['title'] = f"**{obj['title']}**"
    # description
    entry["description"] = obj["description"]
    # constructors
    if ("constructors" in obj and len(obj["constructors"]) > 0):
        constructors = ["```chuck\n" + constr["constructor"] + "(" + argumentString(constr["arguments"]) + ")\n```\n" + constr["description"] for constr in obj["constructors"]]
        entry["constructors"] = ["**Constructors:**"] + constructors
    else:
        entry["constructors"] = []
    # examples
    if ("examples" in obj and len(obj["examples"]) > 0):
        example_md = [f"[{url.split('/')[-1]}]({url})" for url in obj["examples"]]
        entry["examples"] = [ "Examples: \t " + ", ".join(example_md) ]
    else:
        entry["examples"] = []
    functions = []
    if ("member functions" in obj):
        for func in obj["member functions"]:
            # functions += 
            functions.append(f"```chuck\n{func['return type']} {func['member function']}({argumentString(func['arguments'])})\n```\n{func['description']}")
    if ("static member functions" in obj):
        for func in obj["static member functions"]:
            functions.append(f"```chuck\n{func['return type']} {func['static member function']}({argumentString(func['arguments'])})\n```\n{func['description']}")
    if (len(functions) > 0):
        entry["functions"] = ["**Methods:**"] + functions
    else:
        entry["functions"] = []
    # link
    entry["link"] = f"[More...]({obj['link']})"

    return entry


###############################################################################
# MAIN
###############################################################################

# hand-written ugen names
titles = open('titles.json', encoding='utf-8')
title_data = json.load(titles)

# generated ckdoc json
data = {}
for file in files:
    with open(file_dir + file, encoding='utf-8') as f:
        file_data = json.load(f)
        groups = file_data["groups"]
        for group in groups:
            name = group["name"]
            group["link"] = CKDOC_URL + file.split(".")[0] + ".html#" + name
            group["title"] = title_data[name]
            data[name] = group

assert(len(data) == len(title_data))

# output json for ide hover documentation
output = {} 

# iterate through ckdoc for conversion
for entry in data:
    output[entry] = convertToHoverDoc(dict(data[entry]))

# re-iterate for custom CKDoc fixes (common ones)
for entry in output:
    if "Osc" in entry and entry != "Osc":
        output[entry]["functions"] = output["Osc"]["functions"] + output["UGen"]["functions"][1:] + output[entry]["functions"][1:] 
    if "LiSa" in entry and entry != "LiSa":
        output[entry]["functions"] = output["LiSa"]["functions"]
    if entry == "SndBuf2":
        output[entry]["functions"] = output["SndBuf"]["functions"]
    if entry == "Gain":
        output[entry]["functions"] = output["UGen"]["functions"]

# Alphabetize and write to .json file
output = dict(sorted(output.items()))

with open(OUTPUT_FILE_PATH, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)
