# Rezonant

## Prerequisites
- Runtime: NodeJS
- IDE
    - Windows: Visual Studio 2022
    - MacOS: Xcode

- DAW: Reaper
- Libraries
    - Windows: Visual Leak Detector

## Instructions

There is a set of steps that need to be taken in order to get started, however all of the steps are quite automated.

1. Create a new repo for your project: Create your project repo on whatever service you are using e.g GitHub, Bitbucket, etc
2. Clone your project repo to your disk
3. Navigate inside your project repo: E.g `cd my_project`
4. Clone this SK++ repo inside your project repo: `git clone --recurse-submodules https://github.com/superkraft-io/rezonant.git`
5. Navigate into `rezonant`
6. Run `node init`
7. Navigate back to your project and open either `visual_Studio.sln` or `xcode.code-worspace`

### Windows steps
Open visual studio project and install NuGet packages:
- Microsoft.Windows.ImplementationLibrary (version 1.0.250325.1)
- Microsoft.Web.WebView2 (version 1.0.3537.50)

## How to use
You will now mainly put most of your non-critical logic in the SK++ soft backend (virtual JS backend) and occasionally in the hard backend (C++ backend) via native actions,
while your critical logic (such as the audio processing logic) will exist inside the hard backend.

# TROUBLESHOOTING

### Visual Studio complains about that the prebuild script `The command "CALL ...scripts\postbuild-win.bat"`
You need to open Visual Studio with Administator priveleges.

### Visual Studio complains about a NuGet package
You need to install the exact version of the NuGet package.

### My plugin builds but doesn't show up
This is likely due to the plugin ID being the same as another plugin installed on your computer. Change the plugin ID and try again.