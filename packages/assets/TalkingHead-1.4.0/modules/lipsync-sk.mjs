export class LipsyncSk {
  constructor() {
    this.rules = {
      // Vowels
      'A': [{ pattern: /A/, move: 1, visemes: ['aa'] }],
      'Á': [{ pattern: /Á/, move: 1, visemes: ['aa'] }],
      'Ä': [{ pattern: /Ä/, move: 1, visemes: ['E'] }],
      'E': [{ pattern: /E/, move: 1, visemes: ['E'] }],
      'É': [{ pattern: /É/, move: 1, visemes: ['E'] }],
      'I': [{ pattern: /I/, move: 1, visemes: ['I'] }],
      'Í': [{ pattern: /Í/, move: 1, visemes: ['I'] }],
      'O': [{ pattern: /O/, move: 1, visemes: ['O'] }],
      'Ó': [{ pattern: /Ó/, move: 1, visemes: ['O'] }],
      'Ô': [{ pattern: /Ô/, move: 1, visemes: ['U', 'O'] }],
      'U': [{ pattern: /U/, move: 1, visemes: ['U'] }],
      'Ú': [{ pattern: /Ú/, move: 1, visemes: ['U'] }],
      'Y': [{ pattern: /Y/, move: 1, visemes: ['I'] }],
      'Ý': [{ pattern: /Ý/, move: 1, visemes: ['I'] }],

      // Consonants
      'B': [{ pattern: /B/, move: 1, visemes: ['PP'] }],
      'P': [{ pattern: /P/, move: 1, visemes: ['PP'] }],
      'D': [{ pattern: /D/, move: 1, visemes: ['DD'] }],
      'Ď': [{ pattern: /Ď/, move: 1, visemes: ['DD'] }],
      'T': [{ pattern: /T/, move: 1, visemes: ['DD'] }],
      'Ť': [{ pattern: /Ť/, move: 1, visemes: ['DD'] }],
      'C': [{ pattern: /C/, move: 1, visemes: ['SS'] }],
      'Č': [{ pattern: /Č/, move: 1, visemes: ['CH'] }],
      'DZ': [{ pattern: /DZ/, move: 2, visemes: ['SS'] }],
      'DŽ': [{ pattern: /DŽ/, move: 2, visemes: ['CH'] }],
      'F': [{ pattern: /F/, move: 1, visemes: ['FF'] }],
      'V': [{ pattern: /V/, move: 1, visemes: ['VV'] }],
      'S': [{ pattern: /S/, move: 1, visemes: ['SS'] }],
      'Z': [{ pattern: /Z/, move: 1, visemes: ['SS'] }],
      'Š': [{ pattern: /Š/, move: 1, visemes: ['SH'] }],
      'Ž': [{ pattern: /Ž/, move: 1, visemes: ['SH'] }],
      'H': [{ pattern: /H/, move: 1, visemes: ['HH'] }],
      'CH': [{ pattern: /CH/, move: 2, visemes: ['HH'] }],
      'K': [{ pattern: /K/, move: 1, visemes: ['kk'] }],
      'G': [{ pattern: /G/, move: 1, visemes: ['kk'] }],
      'J': [{ pattern: /J/, move: 1, visemes: ['I'] }],
      'L': [{ pattern: /L/, move: 1, visemes: ['LL'] }],
      'Ĺ': [{ pattern: /Ĺ/, move: 1, visemes: ['LL'] }],
      'Ľ': [{ pattern: /Ľ/, move: 1, visemes: ['LL'] }],
      'M': [{ pattern: /M/, move: 1, visemes: ['MM'] }],
      'N': [{ pattern: /N/, move: 1, visemes: ['NN'] }],
      'Ň': [{ pattern: /Ň/, move: 1, visemes: ['NN'] }],
      'R': [{ pattern: /R/, move: 1, visemes: ['RR'] }],
      'Ŕ': [{ pattern: /Ŕ/, move: 1, visemes: ['RR'] }],
    };

    // Relative durations for each viseme (1 = average)
    this.visemeDurations = {
      'aa': 0.9,
      'E': 0.8,
      'I': 0.8,
      'O': 0.9,
      'U': 0.9,
      'PP': 1.0,
      'DD': 1.0,
      'kk': 1.0,
      'SS': 1.1,
      'CH': 1.2,
      'HH': 1.0,
      'VV': 1.0,
      'FF': 1.0,
      'MM': 1.0,
      'NN': 1.0,
      'RR': 1.0,
      'LL': 1.0,
      'sil': 1.0,
    };

    // Durations for special symbols (pauses, punctuation, etc.)
    this.specialDurations = { ' ': 0.5, ',': 2.0, '.': 3.0 };
  }

  /**
     * Preprocess the input text:
     * - Normalize (using NFC) and convert to uppercase.
     * - Trim extra whitespace.
     */
  preProcessText(s) {
    return s.normalize('NFC').toUpperCase().trim().replace(/\s+/g, ' ');
  }

  /**
     * Convert text into a sequence of visemes and associated timing information.
     * @param {string} text - The input text.
     * @return {Object} - An object with properties: words, visemes, times, durations.
     */
  wordsToVisemes(text) {
    const processed = this.preProcessText(text);
    const visemes = [];
    const times = [];
    const durations = [];
    let t = 0;
    let i = 0;

    while (i < processed.length) {
      let matched = false;

      // Check multi-character rules first
      for (const key of Object.keys(this.rules)) {
        if (key.length > 1 && processed.startsWith(key, i)) {
          const rule = this.rules[key][0];
          for (const vis of rule.visemes) {
            if (visemes.length && visemes[visemes.length - 1] === vis) {
              const d = this.visemeDurations[vis] * 0.7;
              durations[durations.length - 1] += d;
              t += d;
            } else {
              visemes.push(vis);
              times.push(t);
              durations.push(this.visemeDurations[vis]);
              t += this.visemeDurations[vis];
            }
          }
          i += rule.move;
          matched = true;
          break;
        }
      }

      if (!matched) {
        const ch = processed[i];
        if (this.rules[ch]) {
          const rule = this.rules[ch][0];
          for (const vis of rule.visemes) {
            if (visemes.length && visemes[visemes.length - 1] === vis) {
              const d = this.visemeDurations[vis] * 0.7;
              durations[durations.length - 1] += d;
              t += d;
            } else {
              visemes.push(vis);
              times.push(t);
              durations.push(this.visemeDurations[vis]);
              t += this.visemeDurations[vis];
            }
          }
          i += rule.move;
        } else {
          t += this.specialDurations[ch] || 0;
          i++;
        }
      }
    }

    return { words: processed, visemes, times, durations };
  }
}
