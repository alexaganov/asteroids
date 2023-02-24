class Sound {
  private audio: HTMLAudioElement;
  private isPlaying = false;

  constructor(src: string | Sound) {
    src = typeof src !== 'string' ? src.audio.src : src;

    this.audio = new Audio(src);
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  play({ onEnd }: { onEnd: () => void }) {
    this.isPlaying = true;
    this.audio.play();
    this.audio.addEventListener(
      'ended',
      () => {
        onEnd();
        this.isPlaying = false;
      },
      {
        once: true
      }
    );
  }
}

class SoundEffects {
  private sounds = new Map<
    string,
    {
      source: Sound;
      inUse: Set<Sound>;
      free: Set<Sound>;
    }
  >();

  constructor(sounds: Record<string, string>) {
    for (const sound in sounds) {
      this.sounds.set(sound, {
        source: new Sound(sounds[sound]),
        inUse: new Set(),
        free: new Set()
      });
    }
  }

  play(soundName: string) {
    const sound = this.sounds.get(soundName);

    if (!sound) {
      return;
    }

    let [freeSound] = sound.free;

    if (freeSound) {
      sound.inUse.add(freeSound);
      sound.free.delete(freeSound);
    } else {
      freeSound = new Sound(sound.source);
    }

    freeSound.play({
      onEnd: () => {
        sound.inUse.delete(freeSound);
        sound.free.add(freeSound);
      }
    });
  }
}

export default SoundEffects;
