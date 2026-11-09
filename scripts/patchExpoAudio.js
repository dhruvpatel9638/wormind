const fs = require('fs');
const path = require('path');

// 1. Patch AudioUtils.kt
const audioUtilsPath = path.join(__dirname, '../node_modules/expo-audio/android/src/main/java/expo/modules/audio/AudioUtils.kt');
let audioUtils = fs.readFileSync(audioUtilsPath, 'utf8');

const targetUtils = `fun buildBasicMediaSession(context: Context, player: ExoPlayer): MediaSession {
  return MediaSession.Builder(context, player)
    .setId("ExpoAudioBasicMediaSession_\${player.hashCode()}")
    .build()
}`;

const replacementUtils = `fun buildBasicMediaSession(context: Context, player: ExoPlayer): MediaSession {
  return MediaSession.Builder(context, player)
    .setId("ExpoAudioBasicMediaSession_\${player.hashCode()}")
    .setCallback(object : MediaSession.Callback {
      override fun onConnect(
        session: MediaSession,
        controller: MediaSession.ControllerInfo
      ): MediaSession.ConnectionResult {
        return MediaSession.ConnectionResult.reject()
      }
    })
    .build()
}`;

if (audioUtils.includes(targetUtils)) {
  audioUtils = audioUtils.replace(targetUtils, replacementUtils);
  fs.writeFileSync(audioUtilsPath, audioUtils);
  console.log('Successfully patched AudioUtils.kt');
} else if (audioUtils.includes('MediaSession.ConnectionResult.reject()')) {
  console.log('AudioUtils.kt already patched');
} else {
  console.warn('Target in AudioUtils.kt not found');
}

// 2. Patch AudioModule.kt to prevent blind auto-resuming of playables on activity foreground
const audioModulePath = path.join(__dirname, '../node_modules/expo-audio/android/src/main/java/expo/modules/audio/AudioModule.kt');
let audioModule = fs.readFileSync(audioModulePath, 'utf8');

const targetForeground = `        allPlayables.forEach { playable ->
          if (playable.isPaused) {
            playable.isPaused = false
            playable.play()
          }
        }`;

const replacementForeground = `        // Do not auto-resume audio players blindly when returning to foreground.
        // Game audio state (BGM and SFX) is controlled strictly by application logic.
        allPlayables.forEach { playable ->
          playable.isPaused = false
        }`;

if (audioModule.includes(targetForeground)) {
  audioModule = audioModule.replace(targetForeground, replacementForeground);
  fs.writeFileSync(audioModulePath, audioModule);
  console.log('Successfully patched AudioModule.kt');
} else if (audioModule.includes('Game audio state (BGM and SFX) is controlled strictly')) {
  console.log('AudioModule.kt already patched');
} else {
  console.warn('Target in AudioModule.kt not found');
}
