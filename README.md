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

- Create a new repo for your project: Create your project repo on whatever service you are using e.g GitHub, Bitbucket, etc
- Clone your project repo to your disk
- Navigate inside your project repo: E.g `cd my_project`
- Clone this SK++ repo inside your project repo: `git clone https://github.com/superkraft-io/rezonant.git`
- Navigate into `rezonant`
- Run `node init`

### Windows steps
Open visual studio project and install NuGet packages: WIL and WebView2

You will now mainly put most of your non-critical logic in the SK++ soft backend (virtual JS backend) and occasionally in the hard backend (C++ backend) via native actions,
while your critical logic (such as the audio processing logic) will exist inside the hard backend.

