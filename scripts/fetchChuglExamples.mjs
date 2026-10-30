/**
 * Fetch all ChuGL examples from chuck.stanford.edu and generate moreChuglExamples.json
 *
 * Usage: node scripts/fetchChuglExamples.mjs
 */

const BASE = "https://chuck.stanford.edu/chugl/examples/";
const CATEGORIES = ["basic", "deep", "education", "rendergraph", "sequencers"];

async function fetchDirectoryListing(url) {
    const res = await fetch(url);
    const html = await res.text();
    // Parse Apache directory listing links
    const entries = [];
    const regex = /href="([^"?]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const name = match[1];
        // Skip parent directory and non-relevant links
        if (name === "../" || name.startsWith("/") || name.startsWith("http")) continue;
        entries.push(name);
    }
    return entries;
}

async function fetchFileContent(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
}

async function main() {
    const json = {};

    // Root "examples" key lists the categories
    json["examples"] = CATEGORIES.map((cat) => cat);

    for (const category of CATEGORIES) {
        const catUrl = `${BASE}${category}/`;
        console.log(`Fetching ${catUrl}...`);
        const entries = await fetchDirectoryListing(catUrl);

        const items = [];

        for (const entry of entries) {
            if (entry.endsWith(".ck")) {
                // It's a ChucK file
                const fileUrl = `${catUrl}${entry}`;
                console.log(`  Fetching ${entry}...`);
                const code = await fetchFileContent(fileUrl);
                if (code) {
                    const example = {
                        name: entry,
                        code: code,
                        data: [],
                    };
                    items.push({ [entry]: example });
                }
            }
            // Skip non-.ck files (data files, subdirectories, etc.)
        }

        json[category] = items;
    }

    // Write to public/examples/moreChuglExamples.json
    const fs = await import("fs");
    const path = await import("path");
    const outPath = path.join(
        import.meta.dirname,
        "..",
        "public",
        "examples",
        "moreChuglExamples.json"
    );
    fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
    console.log(`\nWrote ${outPath}`);

    // Count examples
    let total = 0;
    for (const cat of CATEGORIES) {
        const count = json[cat].length;
        total += count;
        console.log(`  ${cat}: ${count} examples`);
    }
    console.log(`  Total: ${total} examples`);
}

main().catch(console.error);
