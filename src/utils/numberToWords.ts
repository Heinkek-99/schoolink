const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  
  let result = '';
  
  if (n >= 100) {
    const h = Math.floor(n / 100);
    result += h === 1 ? 'cent' : units[h] + ' cent';
    n %= 100;
    if (n === 0 && h > 1) result += 's';
    if (n > 0) result += ' ';
  }
  
  if (n >= 10 && n < 20) {
    result += teens[n - 10];
  } else if (n >= 20) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    
    if (t === 7 || t === 9) {
      // 70s and 90s use the teens
      const base = t === 7 ? 'soixante' : 'quatre-vingt';
      const remainder = t === 7 ? 10 + u : 10 + u;
      if (remainder >= 10 && remainder < 20) {
        result += base + (t === 7 && u === 1 ? ' et ' : '-') + teens[remainder - 10];
      }
    } else {
      result += tens[t];
      if (u === 1 && t !== 8) {
        result += ' et un';
      } else if (u > 0) {
        result += '-' + units[u];
      } else if (t === 8) {
        result += 's';
      }
    }
  } else if (n > 0) {
    result += units[n];
  }
  
  return result;
}

export function numberToWordsFr(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0) return 'moins ' + numberToWordsFr(-n);
  
  n = Math.floor(n);
  
  let result = '';
  
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += (millions === 1 ? 'un million' : convertHundreds(millions) + ' millions');
    n %= 1000000;
    if (n > 0) result += ' ';
  }
  
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += (thousands === 1 ? 'mille' : convertHundreds(thousands) + ' mille');
    n %= 1000;
    if (n > 0) result += ' ';
  }
  
  if (n > 0) {
    result += convertHundreds(n);
  }
  
  return result.trim();
}
