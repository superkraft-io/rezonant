#!/usr/bin/env node

/**
 * iPlug Project Duplicator (Node.js Module)
 * Ported and modularized from duplicate.py (Oli Larkin 2012–2024) — License: WTFPL
 *
 * Exported API:
 *   const { duplicateProject } = require('./duplicate');
 *   await duplicateProject({
 *       inputProjectName: 'IPlugEffect',
 *       outputProjectName: 'MyCoolEffect',
 *       manufacturerName: 'AcmeInc',
 *       outputBasePath: 'C:/path/to/output', // optional, defaults to process.cwd()
 *       rewriteIPlugRoot: true,              // optional, defaults to true
 *       gitignoreTemplatePath: '.../gitignore_template' // optional
 *   });
 *
 * CLI (optional):
 *   node duplicate.js <input> <output> <manufacturer> [outputBasePath]
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');

const VERSION = '0.97';

// Binary file extensions to skip text replacement
const FILTERED_FILE_EXTENSIONS = ['.ico', '.icns', '.pdf', '.png', '.zip', '.exe', '.wav', '.aif'];

// Files/folders to NOT copy (basic * and ? wildcard supported)
const DONT_COPY = [
    'node_modules', '.vs', '*.exe', '*.dmg', '*.pkg', '*.mpkg',
    '*.svn', '*.ncb', '*.suo', '*sdf', 'ipch', 'build-*', '*.layout',
    '*.depend', '.DS_Store', 'xcuserdata', '*.aps', '.reapeaks'
];

// Subfolders to search/descend into during replacements
const SUBFOLDERS_TO_SEARCH = [
    'projects', 'config', 'resources', 'installer', 'scripts', 'manual',
    'xcschemes', 'xcshareddata', 'xcuserdata', 'en-osx.lproj',
    'project.xcworkspace', 'Images.xcassets', 'web-ui', 'ui', 'UI', 'DSP'
];

function isBinaryByExt(filePath) {
    const ext = path.extname(filePath);
    return FILTERED_FILE_EXTENSIONS.includes(ext);
}

function toRegExpFromGlob(glob) {
    // Convert a very small glob subset to a safe, anchored regex:
    // *  -> .*
    // ?  -> .
    // all other regex metachars are escaped
    let out = '';
    for (const ch of glob) {
        if (ch === '*') out += '.*';
        else if (ch === '?') out += '.';
        else if ('\\.^$+{}()|[]'.includes(ch)) out += '\\' + ch;
        else out += ch;
    }
    return new RegExp(`^${out}$`, 'i');
}

const dontCopyRegexes = DONT_COPY.map(toRegExpFromGlob);

function shouldIgnore(name) {
    return dontCopyRegexes.some((re) => re.test(name));
}

function randomFourChar(chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let out = '';
    for (let i = 0; i < 4; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
}

function replaceAll(text, search, replacement) {
    if (!search) return text;
    return text.split(search).join(replacement);
}

async function copyTree(src, dest) {
    const stat = await fsp.lstat(src);
    if (stat.isSymbolicLink()) {
        const linkTarget = await fsp.readlink(src);
        await fsp.symlink(linkTarget, dest);
        return;
    }
    if (stat.isDirectory()) {
        const base = path.basename(src);
        if (shouldIgnore(base)) return;

        await fsp.mkdir(dest, { recursive: true });
        const entries = await fsp.readdir(src);
        for (const entry of entries) {
            if (shouldIgnore(entry)) continue;
            await copyTree(path.join(src, entry), path.join(dest, entry));
        }
    } else if (stat.isFile()) {
        const base = path.basename(src);
        if (shouldIgnore(base)) return;
        await fsp.copyFile(src, dest);
    }
}

async function readText(filePath) {
    return fsp.readFile(filePath, 'utf8');
}

async function writeText(filePath, content) {
    await fsp.writeFile(filePath, content, 'utf8');
}

async function renameIfMatches(dir, f, searchproject, replaceproject) {
    const cases = [
        ['-macOS.xcodeproj', '-macOS.xcodeproj'],
        ['-iOS.xcodeproj', '-iOS.xcodeproj'],
        ['.xcworkspace', '.xcworkspace'],
        ['iOSAppIcon.appiconset', 'iOSAppIcon.appiconset']
    ];
    for (const [oldSuf, newSuf] of cases) {
        if (f === `${searchproject}${oldSuf}`) {
            const from = path.join(dir, f);
            const to = path.join(dir, `${replaceproject}${newSuf}`);
            await fsp.rename(from, to);
            return path.basename(to);
        }
    }
    return f;
}

async function parseXcconfig(xcconfigPath) {
    // Minimal parser: key = value (ignores comments and spaces)
    const out = {};
    try {
        const raw = await readText(xcconfigPath);
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;
            const m = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
            if (m) {
                out[m[1]] = m[2].trim();
            }
        }
    } catch {
        // ignore; file may not exist
    }
    return out;
}

async function setUniqueId(projectRoot, uniqueId) {
    // Search in config/ for a line like: #define PLUG_UNIQUE_ID 'ABCD'
    const cfgDir = path.join(projectRoot, 'config');
    async function walk(dir) {
        let items = [];
        try {
            items = await fsp.readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const it of items) {
            const full = path.join(dir, it.name);
            if (it.isDirectory()) {
                await walk(full);
            } else if (it.isFile() && /\.(h|hpp|txt|inl|mm|m|cpp|c)$/.test(it.name)) {
                try {
                    let txt = await readText(full);
                    const before = txt;
                    txt = txt.replace(
                        /#define\s+PLUG_UNIQUE_ID\s+'?[A-Za-z0-9]{4}'?/,
                        `#define PLUG_UNIQUE_ID '${uniqueId}'`
                    );
                    if (txt !== before) {
                        await writeText(full, txt);
                    }
                } catch {
                    // ignore individual file errors
                }
            }
        }
    }
    await walk(cfgDir);
}

async function replaceInFile(filePath, searchproject, replaceproject, searchman, replaceman, oldroot, newroot) {
    if (isBinaryByExt(filePath)) {
        return; // skip binary-like files
    }

    let content;
    try {
        content = await readText(filePath);
    } catch {
        return;
    }

    content = replaceAll(content, searchproject, replaceproject);
    content = replaceAll(content, searchproject.toUpperCase(), replaceproject.toUpperCase());
    content = replaceAll(content, searchman, replaceman);

    if (oldroot && newroot) {
        content = replaceAll(content, oldroot, newroot);
        // Windows-style path variant:
        content = replaceAll(content, oldroot.replace(/\//g, '\\'), newroot.replace(/\//g, '\\'));
    }

    await writeText(filePath, content);
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walkAndProcess(dir, searchproject, replaceproject, searchman, replaceman, oldroot, newroot) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (let entry of entries) {
        let name = entry.name;
        let fullpath = path.join(dir, name);

        if (entry.isDirectory()) {
            const maybeRenamed = await renameIfMatches(dir, name, searchproject, replaceproject);
            if (maybeRenamed !== name) {
                name = maybeRenamed;
                fullpath = path.join(dir, name);
                entry = await fsp.lstat(fullpath).then(st => ({ isDirectory: () => st.isDirectory(), name }));
            }

            if (
                name === `${replaceproject}-macOS.xcodeproj` ||
                name === `${replaceproject}-iOS.xcodeproj` ||
                name === `${replaceproject}.xcworkspace` ||
                name === `${replaceproject}iOSAppIcon.appiconset` ||
                SUBFOLDERS_TO_SEARCH.includes(name)
            ) {
                await walkAndProcess(fullpath, searchproject, replaceproject, searchman, replaceman, oldroot, newroot);
            }
        } else if (entry.isFile()) {
            const filename = path.basename(fullpath);
            const newfilename = filename.replace(new RegExp(escapeRegExp(searchproject), 'g'), replaceproject);

            await replaceInFile(fullpath, searchproject, replaceproject, searchman, replaceman, oldroot, newroot);

            if (filename !== newfilename) {
                await fsp.rename(fullpath, path.join(dir, newfilename));
            }
        }
    }
}


async function fixStuff(options) {
    var os =  process.platform

    //fix prebuild script call
   

    if (os === 'win32'){
        var strToReplace = '$(SolutionDir)..\\..\\..\\rezonant\\iPlug2_SK\\skxx\\bundler\\sk_prebuild_script.js'
        var replacementStr = '$(SolutionDir)..\\..\\rezonant\\skxx\\bundler\\sk_prebuild_script.js'

        var path = options.outputBasePath  + `/${options.outputProjectName}/projects/${options.outputProjectName}-app.vcxproj`
        var input = fs.readFileSync(path).toString()
        var out = input.split(strToReplace).join(replacementStr).split('\\').join('/');
        fs.writeFileSync(path, out)

        path = options.outputBasePath  + `/${options.outputProjectName}/projects/${options.outputProjectName}-vst3.vcxproj`
        input = fs.readFileSync(path).toString()
        var out = input.split(strToReplace).join(replacementStr).split('\\').join('/');
        fs.writeFileSync(path, out)
    }

    if (os === 'darwin'){

    }
}


/**
 * Duplicate an iPlug2 project tree with renames and in-file replacements.
 *
 * @param {Object} options
 * @param {string} options.inputProjectName           // Required, no spaces
 * @param {string} options.outputProjectName          // Required, no spaces
 * @param {string} options.manufacturerName           // Required, no spaces
 * @param {string} [options.outputBasePath]           // Defaults to process.cwd()
 * @param {boolean} [options.rewriteIPlugRoot]        // If true, tries to remap IPLUG2_ROOT from <input>/config/<input>-mac.xcconfig
 * @param {string} [options.gitignoreTemplatePath]    // Path to gitignore_template; if missing, writes a minimal .gitignore
 * @returns {Promise<{uniqueId:string, outputPath:string, inputPath:string}>}
 */
async function duplicateProject(options) {
    const {
        inputProjectName,                              // now accepts a path
        outputProjectName,
        manufacturerName,
        outputBasePath = process.cwd(),
        rewriteIPlugRoot = true,
        gitignoreTemplatePath = path.join(process.cwd(), 'gitignore_template')
    } = options || {};

    if (!inputProjectName || !outputProjectName || !manufacturerName) {
        throw new Error('inputProjectName, outputProjectName, and manufacturerName are required');
    }
    // Allow spaces in the INPUT PATH, but still forbid spaces in the resulting project name and manufacturer
    if (/\s/.test(outputProjectName)) throw new Error('output project name has spaces');
    if (/\s/.test(manufacturerName)) throw new Error('manufacturer name has spaces');

    // Resolve input as a real path and derive the original project "name" from its basename
    const inputPath = path.resolve(inputProjectName.replace(/[\\/]+$/, '')); // strip trailing slash/backslash
    const inputName = path.basename(inputPath); // used for replacements like <inputName>-mac.xcconfig etc.

    const outputName = outputProjectName.replace(/[\\/]+$/, '');
    const outputPath = path.join(path.resolve(outputBasePath), outputName);

    if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isDirectory()) {
        throw new Error('input project path not found or not a directory');
    }
    if (!fs.existsSync(outputBasePath) || !fs.statSync(outputBasePath).isDirectory()) {
        throw new Error('outputBasePath does not exist');
    }
    if (fs.existsSync(outputPath)) {
        throw new Error('output project already exists');
    }

    await copyTree(inputPath, outputPath);

    let oldroot = '';
    let newroot = '';
    if (rewriteIPlugRoot) {
        const configPath = path.join(inputPath, 'config');
        const xcPath = path.join(configPath, `${inputName}-mac.xcconfig`);
        const xc = await parseXcconfig(xcPath);
        oldroot = xc['IPLUG2_ROOT'] || '';
        if (oldroot) {
            // Compute new relative path from the NEW project's config folder to the SAME absolute iPlug2 folder
            const iplug2folderAbs = path.resolve(configPath, oldroot);
            const newConfigDir = path.join(outputPath, 'config');
            newroot = path.relative(newConfigDir, iplug2folderAbs).replace(/\\/g, '/');
        }
    }

    await walkAndProcess(
        outputPath,
        inputName,              // searchproject (basename of source path)
        outputName,             // replaceproject
        'AcmeInc',
        manufacturerName,
        oldroot,
        newroot
    );

    // .gitignore
    try {
        if (fs.existsSync(gitignoreTemplatePath)) {
            await fsp.copyFile(gitignoreTemplatePath, path.join(outputPath, '.gitignore'));
        } else {
            await writeText(path.join(outputPath, '.gitignore'), '# iPlug2 project\nbuild-*\nxcuserdata/\n.DS_Store\n');
        }
    } catch {
        // ignore
    }

    // Unique ID
    const uniqueId = randomFourChar();
    await setUniqueId(outputPath, uniqueId);


    await fixStuff(options)

    return { uniqueId, outputPath, inputPath };
}

module.exports = { duplicateProject };