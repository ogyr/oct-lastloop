# Effect: Gradle allprojects.repositories Fix for JFrog

## Context
SoftPOS build failed because JFrog maven repo was only declared in `hws-android` module's `build.gradle.kts`, but Gradle resolves transitive dependencies through root project's `allprojects.repositories`.

## Error
```
Could not find com.rubean.phonepos:api:2.16.8.
Searched in the following locations:
  - https://dl.google.com/dl/android/maven2/...
  - https://repo.maven.apache.org/maven2/...
  - https://www.jitpack.io/...
  - https://central.sonatype.com/...
Required by: project :app > project :expo > project :hws-android
```

## Solution
Added conditional JFrog repo to root `build.gradle`:

```groovy
allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
    // Rubean JFrog repository for PhonePos API (SoftPOS integration)
    // Only added when JFROG_USER env var is set
    if (System.getenv('JFROG_USER')?.trim()) {
      maven {
        url 'https://rubean.jfrog.io/artifactory/bbva'
        credentials {
          username = System.getenv('JFROG_USER') ?: ''
          password = System.getenv('JFROG_PASSWORD') ?: ''
        }
      }
    }
  }
}
```

## Verification
After fix, build progressed from "repo not found" to "401 Unauthorized" — confirming repo was now reachable.

## File Changed
`packages/mobile/android/build.gradle`

## Lessons
1. **Gradle module repos ≠ app repos**: Module-level `repositories {}` blocks don't propagate to transitive dependency resolution
2. **Android multi-module builds**: Dependencies resolved in app context need repos declared at `allprojects` level
3. **Conditional pattern**: Groovy `System.getenv('VAR')?.trim()` works for conditional repo registration
