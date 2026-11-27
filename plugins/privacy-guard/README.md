# Telemetry Inspector (遥测与外传检测)

**Telemetry Inspector** (`@penguinharness/privacy-guard`) is a local privacy and telemetry auditing workbench for macOS applications. Open it from the Agent's App Center to inspect installed desktop apps without configuring a proxy or installing root certificates.

## Features

- **Three-Tier Privacy & Exfiltration Audit**: Clearly separates application network behavior into three distinct categories:
  1. **Telemetry & Analytics (`telemetry`)**: Detects embedded third-party analytics and crash-reporting SDKs (PostHog, Sentry, Mixpanel, Amplitude, Segment, VS Code TAS/AppCenter, Datadog, SensorsData, Bugly) and default telemetry switches (`enableTelemetry: true`).
  2. **Session History Sync (`sessionHistory`)**: Identifies cloud conversation synchronization and background prompt/session log upload endpoints.
  3. **Codebase Exfiltration (`codebaseExfil`)**: Flags high-risk background workspace indexing, repository archiving, and keychain access (`keytar`).
- **Static Bundle Unpacking & Permission Inspection**: Reads macOS `.app` bundles under `/Applications` and `~/Applications` (plus any custom `.app` path you provide), inspecting `Contents/Info.plist` privacy permissions (`NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, `NSScreenCaptureUsageDescription`, `NSDocumentsFolderUsageDescription`, etc.), unpacked Electron resources, and binary `.asar` archives directly in Node.js or Electron.
- **Live Socket & Traffic Monitoring**: Uses macOS `lsof -i` and `nettop` to list active outbound connections and cumulative upload/download bytes (`bytes_out` / `bytes_in`) per process.
- **Reference Case Lab**: Includes two built-in reference specimens demonstrating the boundary between basic usage telemetry and high-risk silent session/codebase exfiltration.
- **One-Click Remediation & AI Privacy Advisor**: Generates ready-to-copy `/etc/hosts` domain blocking rules, application firewall commands, Markdown audit reports (`GET /export-report`), and plain-language explanations via a tool-disabled (`deny-all`) PenguinHarness Agent Session.

## Scope & Privacy

All static bundle inspection and live socket sampling run locally on your Mac. The workbench reads `/Applications`, `~/Applications`, and user-specified `.app` paths in read-only mode and spawns `plutil`, `lsof`, and `nettop` locally. No application data leaves your machine unless you explicitly request an **AI Advisor** interpretation, which sends only the selected app's summary metadata to the Agent's configured chat model.
