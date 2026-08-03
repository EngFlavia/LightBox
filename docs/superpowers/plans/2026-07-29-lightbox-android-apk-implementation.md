# LightBox Android APK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package LightBox as an offline Android APK that installs directly on a tablet.

**Architecture:** Capacitor copies the existing static app into an Android project and serves it from the APK. Android Gradle produces a debug-signed APK for direct installation.

**Tech Stack:** Capacitor, Android Gradle Plugin, Java, existing HTML/CSS/JavaScript app.

## Global Constraints

- APK must include all web assets and work offline.
- Images must remain on-device and use the Android system picker.
- Output must be a debug APK suitable for direct tablet installation.

---

### Task 1: Create and build the Capacitor Android wrapper

**Files:**
- Create: `capacitor.config.ts`, `android/`
- Modify: `package.json`
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`

- [ ] Install `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` as development dependencies.
- [ ] Add `capacitor.config.ts` with `appId: 'com.engflavia.lightbox'`, `appName: 'LightBox'`, and `webDir: '.'`.
- [ ] Run `npx cap add android`, then `npx cap sync android` to copy the current app assets.
- [ ] Set the Android app label to `LightBox` and replace the generated launcher icon with the LightBox SVG-derived Android icon.
- [ ] Run `gradlew.bat assembleDebug` from `android`.
- [ ] Verify the generated APK exists and run the JavaScript test suite with the bundled Node runtime.
- [ ] Commit the Capacitor configuration and Android project with `feat: package LightBox for Android`.

### Task 2: Prepare the installation artifact

**Files:**
- Create: `release/LightBox-debug.apk`
- Create: `release/INSTALAR-NO-TABLET.md`

- [ ] Copy the verified debug APK to `release/LightBox-debug.apk`.
- [ ] Write installation instructions: transfer APK to the tablet, allow the file manager to install unknown apps when prompted, open the APK, and launch LightBox from the home screen.
- [ ] Confirm APK file size is non-zero and record its SHA-256 checksum in the installation guide.
- [ ] Commit the guide with `docs: add Android tablet installation guide`.
