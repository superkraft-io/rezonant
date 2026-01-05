<img src="resources/logo_facets.png" alt="Rezonant Logo" width="256">

# Rezonant

Rezonant is a minimalistic WebView based VST3/AU2 development framework based on iPlug2 and Superkraft.

The goal is to make DAW plugin development easy, fun, and efficient.

A base Rezonant project is quite small:
- MacOS: 10MB size on disk and less than 50MB RAM

and that includes the entire UI library, backend logic, and more.


The coding style imitates how NodeJS/ElectronJS apps are developed.

## JOIN

- Discord: [Join here](https://discord.gg/3Xc3hn53MT)

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
- Optimized in all aspects, such as sending visual data from the backend to the frontend (VU data, Spectrogram, etc...)


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

## Configuring

### Bit depth
iPlug2 uses `double` data type by default.
To use `float` instead, you have to add `SAMPLE_TYPE_FLOAT` to your project preprocessor definitions:
- In Visual Studio: Project Settings -> Select configuration `All Configurations` -> C/C++ -> Preprocessor -> Preprocessor Definitions -> Edit -> Add `SAMPLE_TYPE_FLOAT`

This is relevant when adding code to the `ProcessBlock()` function, where the `samples` data type becomes `float` instead of `double`.

# TROUBLESHOOTING

### Visual Studio complains about that the prebuild script `The command "CALL ...scripts\postbuild-win.bat"`
You need to open Visual Studio with Administator priveleges.

### Visual Studio complains about a NuGet package
You need to install the exact version of the NuGet package.

### The IDE closes the standalone app of the plugin as soon as I run it
There are two documented reasons why this may be happening.

**An instance of your app is already running**
Make sure that you are not running a copy of your app already.

Looking at `config.h`, there is a macro named `APP_MULT 1` enables/disables multiple instances of your app to run.

**Failing to load config file**
This is most likely due to SK++ failing to load the SK config file located inside `soft_backend`.
Ensure the following:
- `soft_backend` exists in your project
- **ONLY** `.soft_backend` exists inside the `rezonant` repo. Notice that this one has a dot (.) at the beginning. If there exists a non-dot `soft_backend` folder inside the `rezonant` repo, SK++ will fail, and thus your plugin won't run.

### My plugin builds but doesn't show up inside the DAW
This is likely due to the plugin ID being the same as another plugin installed on your computer. Change the plugin ID and try again.
The Rezonant init script normally generates a unique ID, but there is no way of ensuring that the auto-generated ID won't crash with other vendors IDs.

### My AUv2 plugin doesn't show up inside the DAW
Ensure that your `.component` file is in the root of the `Components` folder like this: `.../Components/myPlugin.component`
and not in a subfolder like this: `.../Components/subfolder/myPlugin.component`

### I refresh the frontend of the plugin, but some frontend code is not reloaded (none bundling)
Just close the plugin window and re-open it again. This will force reloading all assets.


# The Future
- Adopt a better and lightweight web renderer
[Ultralight](https://ultralig.ht/) may be a good option, but is not free (I think?) and is also missing some things ([See here](https://github.com/ultralight-ux/Ultralight/issues/178)).
[Servo](https://servo.org/) is free an open source, but is Rust based.
Writing a custom renderer is possible, but also probably a multi-year initiative. I'm not doing that any time soon.

- More build targets
    - CLAP
    - AAX
    - Linux
    - iOS
    - iOS standalone app (iPlug2 apparently already has this)
    - Android
    - WAM

- CMAKE (Latest version of iPlug2 apparently already has this)




# Guides

## Debugging

Here are a few things you can do to debug your plugin:
- Open dev tools inside the UI of your plugin and ensure that you don't have continous flowing errors

## MacOS

### Codesigning, Hardening & Notarization

This process containes a few steps that need to be exectuted sequentially:
1. Configuring Xcode
2. Configuring your project
3. Codesign & Hardening
4. Notarizing
5. Stapling


#### 1. Configure Xcode
- Open Xcode
- Open Settings
- Click "Accounts" tab
- Add and log in to your Apple ID
- Select your team
- Click "Manage Certificates..." at the lower right corner
- Click the `+` (plus) button with a dropdown icon at the lower left corner
- Select "Developer ID Application"

Once certificates are downloaded, click the Done button and close the Settings window.

#### 2. Configure your project
- Click on your project
- Select "Signing & Capabilities"
- Uncheck "Automatically manage signing"
- Select your team
- Set "Signing Certificate" to `Developer ID Application`

Now build your targets AUv2 and VST3 and wait until they complete building.

Once built, open terminal and follow the below instructions to codesign and notarize

#### 3. Codesigning & Hardening
Run this command for both the VST3 and the AUv2:
`codesign --deep --force --options runtime --timestamp --sign "Developer ID Application: <team name> (<team id>)" <path to your VST3 or AUv2>`

Make sure to resplace `<team name>` and `<team id>` and `<path to plugin VST3 or AUv2>`

Example:
`codesign --deep --force --options runtime --timestamp --sign "Developer ID Application: Superkraft (A12BC3DEF4)"/Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst3`

Expected output:
`/Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst3: replacing existing signature`

#### 4. Notarizing
First you need an "App Specific Password".
To get one, you need to log in to your Apple ID accoint `https://account.apple.com`.
Once logged in, click on "App Specific Passwords" and create one.

Use in step 2 below:

1. Zip the plugin:
    - Zip VST3: `zip -r myPlugin-vst3.zip /Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst3`
    - Zip AUv2: `zip -r myPlugin-au2.zip /Users/username/Library/Audio/Plug-Ins/Components/myPlugin.component`

2. Notarize the plugin:
    - Notarize VST3: `xcrun notarytool submit myPlugin-vst3.zip --apple-id "YOUR_APPLE_ID_EMAIL" --team-id "A12BC3DEF4 (raplace this)" --password "YOUR_APP_SPECIFIC_PASSWORD" --wait`
    - Notarize AUv2: `xcrun notarytool submit myPlugin-vst3.zip --apple-id "YOUR_APPLE_ID_EMAIL" --team-id "A12BC3DEF4 (raplace this)" --password "YOUR_APP_SPECIFIC_PASSWORD" --wait`


Expected output:
```
Conducting pre-submission checks for myPlugin-vst3.zip and initiating connection to the Apple notary service...
Submission ID received
  id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
Upload progress: 100.00% (104 MB of 104 MB)   
Successfully uploaded file
  id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  path: /Users/username/myPlugin-vst3.zip
Waiting for processing to complete.
Current status: Accepted............
Processing complete
  id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  status: Accepted
```

#### 5. Stapling
Stapling makes your plugin "offline read", meaning that MacOS will not reach out to the Apple servers to verify that the plugin is legitimate.

Instead the plugin is stapled with a proof that it is legitimate.

Now that your plugin files (VST3 and AUv2) are notarized, they need to be stapled.

Run the following command for both of your plugin files:
`xcrun stapler staple /Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst3`

Expected output:
```
Processing: /Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst3
Processing: /Users/username/Library/Audio/Plug-Ins/VST3/myPlugin.vst
The staple and validate action worked!
```


Done!

Now your plugin should be ready for deployment to millions of users.

Have fun!