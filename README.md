# Rezonant

Rezonant is a minimalistic WebView based VST3/AU2 development framework based on iPlug2 and Superkraft.

The goal is to make DAW plugin development easy, fun, and efficient.

A Rezonant project starts at around 50MB size on disk and less than 100MB RAM.

The coding style imitates how NodeJS/ElectronJS apps are developed.

## Features

- Bundling: None, Shallow, Deep
- Plugin parameter logic: Automatically handles plugin parameter logic for you. Just add a plugin compatible UI component (slider, checkbox, switch, list...) and give it a plugin parameter ID, and the rest is handled my Rezonant
- Native Actions: Call native C++ functions from the frontend
- NodeJS-like coding style in the frontent
- A virtual backend that behaves very much like a NodeJS backend. This will enable non-critical code to be executed away from the frontend, acting like a bridge
- Multiple windows using the ProtonJS NodeJS module
- Stock UI library thanks to Superkraft
- Easy one-way data push from hard backend to frontend
- Thread safety machanisms
- Screen refreshrate synced data pushing (parameter values, etc...)


## Prerequisites
- Runtime: NodeJS
- IDE
    - Windows: Visual Studio 2022
    - MacOS: Xcode

- DAW: Reaper
- Libraries
    - Windows: (Optional) Visual Leak Detector

## Instructions

There is a set of steps that need to be taken in order to get started, however all of the steps are quite automated.

1. Create a new repo for your project: Create your project repo on whatever service you are using e.g GitHub, Bitbucket, etc
2. Clone your project repo to your disk
3. Navigate inside your project repo: E.g `cd my_project`
4. Clone this SK++ repo inside your project repo: `git clone --recurse-submodules https://github.com/superkraft-io/rezonant.git`
5. Navigate into `rezonant`
6. Run `npm install`
7. Run `node init`
8. Enter your project name and your manufacturer name
9. Navigate back to your project and open either `visual_Studio.sln` or `xcode.code-worspace`

- `IMPORTANT on Windows` Open the Visual Studio project in **USER** mode the first time, and the close Visual Studio and re-open the project in Admin mode

### Windows steps
Open visual studio project and install NuGet packages:
- Microsoft.Windows.ImplementationLibrary (version 1.0.250325.1)
- Microsoft.Web.WebView2 (version 1.0.3537.50)

## Tested on
- Windows 11
- macOS Sonoma 14.5 - Apple M1 - 8GB


## How to use
You will now mainly put most of your non-critical logic in the SK++ soft backend (virtual JS backend) and occasionally in the hard backend (C++ backend) via native actions,
while your critical logic (such as the audio processing logic) will exist inside the hard backend.

### Recommended workflow
During development, always use None Bundling. This will give you hot-reloading of both the frontend and then soft backend.

Once you're happy with wit your plugin, build it using Release mode which will use deep bundling.

> Release mode does not currently support other bundling options such as shallow bundling or none bundling. Usually plugins will be fairly self-contained when it comes to logic and UI.

### Debugging
Press `F12` on Windows and `CMD+Sift+F12` on MacOS to enable debug mode. This will neable `Right Click -> Inspect` inside the plugin window.


# TROUBLESHOOTING

### Visual Studio complains about that the prebuild script `The command "CALL ...scripts\postbuild-win.bat"`
You need to open Visual Studio with Administator priveleges.

### Visual Studio complains about a NuGet package
You need to install the exact version of the NuGet package.

### The IDE closes the standalone app of the plugin as soon as I run it
This is most likely due to SK++ failing to load the SK config file located inside `soft_backend`.
Ensure the following:
- `soft_backend` exists in your project
- **ONLY** `.soft_backend` exists inside the `rezonant` repo. Notice that this one has a dot (.) at the beginning. If there exists a non-dot `soft_backend` folder inside the `rezonant` repo, SK++ will fail, and thus your plugin won't run.

### My plugin builds but doesn't show up inside the DAW
This is likely due to the plugin ID being the same as another plugin installed on your computer. Change the plugin ID and try again.
The Rezonant init script normally generates a unique ID, but there is no way of ensuring that the auto-generated ID won't crash with other vendors IDs.

### I refresh the frontend of the plugin, but some frontend code is not reloaded (none bundling)
Just close the plugin window and re-open it again. This will force reloading all assets.