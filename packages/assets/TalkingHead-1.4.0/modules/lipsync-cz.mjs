/**
 * @class Czech lip-sync processor
 * @author Mikulas Heinz
 *
 * This is a simplified version inspired by an English lipsync class.
 * It uses basic rules for mapping Czech letters (including diacritics)
 * to viseme codes and assigns relative durations.
 * Based on these materials:
 *  - https://docs.aws.amazon.com/polly/latest/dg/ph-table-czech-cs-cz.html
 *  - https://en.wikipedia.org/wiki/Czech_phonology
 *  - https://www.lf.upol.cz/fileadmin/users/289/pronunciation_of_czech_sounds.pdf
 */
export class LipsyncCz {
  constructor() {
    this.rules = {
      // Vowels
      'A': [
        { pattern: /A/, move: 1, visemes: ['aa'] },
      ],
      'Á': [
        { pattern: /Á/, move: 1, visemes: ['aa'] },
      ],
      'E': [
        // E, É, and Ě are all mapped to a similar mid vowel viseme
        { pattern: /[EÉĚ]/, move: 1, visemes: ['E'] },
      ],
      'I': [
        // I, Y, Í, and Ý all produce a similar narrow vowel shape
        { pattern: /[IYÍÝ]/, move: 1, visemes: ['I'] },
      ],
      'O': [
        { pattern: /[OÓ]/, move: 1, visemes: ['O'] },
      ],
      'U': [
        { pattern: /[UÚŮ]/, move: 1, visemes: ['U'] },
      ],
      // Consonants
      'B': [
        { pattern: /B/, move: 1, visemes: ['PP'] },
      ],
      'P': [
        { pattern: /P/, move: 1, visemes: ['PP'] },
      ],
      'D': [
        // Both D and its soft counterpart Ď
        { pattern: /[DĎ]/, move: 1, visemes: ['DD'] },
      ],
      'T': [
        { pattern: /[TŤ]/, move: 1, visemes: ['DD'] },
      ],
      'C': [
        // Czech C is pronounced as [ts]
        { pattern: /C/, move: 1, visemes: ['SS'] },
      ],
      'Č': [
        { pattern: /Č/, move: 1, visemes: ['CH'] },
      ],
      'DŽ': [
        // The digraph DŽ (pronounced [dʒ]) is two letters long.
        { pattern: /DŽ/, move: 2, visemes: ['CH'] },
      ],
      'F': [
        { pattern: /F/, move: 1, visemes: ['FF'] },
      ],
      'V': [
        { pattern: /V/, move: 1, visemes: ['VV'] },
      ],
      'S': [
        { pattern: /S/, move: 1, visemes: ['SS'] },
      ],
      'Z': [
        { pattern: /Z/, move: 1, visemes: ['SS'] },
      ],
      'Š': [
        { pattern: /Š/, move: 1, visemes: ['SH'] },
      ],
      'Ž': [
        { pattern: /Ž/, move: 1, visemes: ['SH'] },
      ],
      'H': [
        { pattern: /H/, move: 1, visemes: ['HH'] },
      ],
      'CH': [
        // The digraph CH is two letters.
        { pattern: /CH/, move: 2, visemes: ['HH'] },
      ],
      'K': [
        { pattern: /K/, move: 1, visemes: ['kk'] },
      ],
      'G': [
        { pattern: /G/, move: 1, visemes: ['kk'] },
      ],
      'J': [
        // J in Czech is pronounced like the English "y" in "yes"
        { pattern: /J/, move: 1, visemes: ['I'] },
      ],
      'M': [
        { pattern: /M/, move: 1, visemes: ['MM'] },
      ],
      'N': [
        { pattern: /N/, move: 1, visemes: ['NN'] },
      ],
      'Ň': [
        { pattern: /Ň/, move: 1, visemes: ['NN'] },
      ],
      'R': [
        { pattern: /R/, move: 1, visemes: ['RR'] },
      ],
      'Ř': [
        { pattern: /Ř/, move: 1, visemes: ['RR'] },
      ],
      // (Additional rules—for example, for diphthongs or other letter combinations—can be added here.)
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
      'MM': 1.0,
      'NN': 1.0,
      'RR': 1.0,
      'sil': 1.0,
    };

    // Durations for special symbols (pauses, punctuation, etc.)
    this.specialDurations = { ' ': 0.5, ',': 2.0, '.': 3.0 };
  }

  /**
     * Preprocess the input text:
     * - Normalize (using NFC) and convert to uppercase.
     * - Trim extra whitespace.
     * - (Additional conversion such as numbers-to-words can be added as needed.)
     *
     * @param {string} s - The input text.
     * @return {string} - The preprocessed text.
     */
  preProcessText(s) {
    return s.normalize('NFC').toUpperCase().trim().replace(/\s+/g, ' ');
  }

  /**
     * Convert text into a sequence of visemes and associated timing information.
     * This method goes letter by letter (or by matching multi-letter rules) and
     * builds the viseme stream.
     *
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
      let ruleFound = false;

      // Check for multi-character keys first (e.g. "CH", "DŽ")
      for (const key of Object.keys(this.rules)) {
        if (key.length > 1 && processed.substring(i, i + key.length) === key) {
          const ruleset = this.rules[key];
          // Use the first applicable rule
          const rule = ruleset[0];
          for (const vis of rule.visemes) {
            // If the same viseme repeats, add a fraction of the duration
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
          ruleFound = true;
          break;
        }
      }

      // If no multi-character rule matched, process single letter.
      if (!ruleFound) {
        const char = processed[i];
        if (this.rules[char]) {
          const ruleset = this.rules[char];
          const rule = ruleset[0];
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
          // For characters not in our rules (e.g. punctuation), use special durations.
          t += this.specialDurations[char] || 0;
          i++;
        }
      }
    }

    return {
      words: processed,
      visemes,
      times,
      durations,
      i,
    };
  }
}
