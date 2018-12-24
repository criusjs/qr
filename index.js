const MODE_Terminator = 0b0000; // 0
const MODE_Numeric = 0b0001; //1 - 
const MODE_Alphanumeric = 0b0010; //2 - 
const MODE_Structured_Append = 0b0011; //3
const MODE_8BIT = 0b0100; //4 - 
const MODE_FNC1_1 = 0b0101; //5
const MODE_ECI = 0b0111; //7
const MODE_Kanji = 0b1000; //8 - 
const MODE_FNC1_2 = 0b1001; //9
const MODE_China = 0b1101; //13

const LEVEL_L = 0b01;
const LEVEL_M = 0b00;
const LEVEL_Q = 0b11;
const LEVEL_H = 0b10;

const MASK_0 = 0b000; // (i+j) % 2 = 0
const MASK_1 = 0b001; // i % 2 = 0
const MASK_2 = 0b010; // j % 3 = 0
const MASK_3 = 0b011; // (i+j) % 3 = 0
const MASK_4 = 0b100; // (i/2 + j/3) % 2 = 0
const MASK_5 = 0b101; // ij % 2 + ij % 3 = 0
const MASK_6 = 0b110; // (ij % 2 + ij % 3) % 2 = 0
const MASK_7 = 0b111; // (ij % 3 + (i+j) % 2) % 2 = 0

function versionBits(version, mode) {
  if (version >= 1 && version <= 9) {
    return [0, 10, 9, 0, 8, 0, 0, 8, 0][mode];
  } else if (version >= 10 && version <= 26) {
    return [0, 12, 11, 0, 16, 0, 0, 10, 0][mode];
  } else if (version >= 27 && version <= 40) {
    return [0, 14, 13, 0, 16, 0, 0, 12, 0][mode];
  }
}


function charValue(char) {
  // 0-44,共45种，采用45进制
  return '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(char);
}

function fillZero(str, length, fillAfter) {
  let len = length - str.length;
  for (let index = 0; index < len; index++) {
    str = fillAfter ? `${str}0` : `0${str}`;
  }
  return str;
}

function binaryString(intvalue) {
  return parseInt(intvalue, 10).toString(2);
}

function getStartCode(version, length, mode) {
  let modeCode = fillZero(binaryString(mode), 4),
    charCode = fillZero(binaryString(length), versionBits(version, mode));
  return `${modeCode}${charCode}`;
}

function getEndCode(code) {
  code += '0000';
  return fillZero(code, Math.ceil(code.length / 8.0) * 8, true);
}

function NumericMode(str, version) {
  // 将每两个字符分为一组，然后转成上 45 进制，再转为 11bits 的二进制结果。对于落单的一个字符，则转为 6bits 的二进制结果
  let endchar = '',
    len = str.length,
    startCode = getStartCode(version, len, MODE_Numeric);
  let arr = str.match(/\d{2,3}/g);

  let strcode = arr.reduce((ret, item) => {
    if (item.length === 3) {
      return ret += fillZero(binaryString(item), versionBits(version, MODE_Numeric))
    } else if (item.length === 2) {
      return ret += fillZero(binaryString(item), 8)
    } else if (item.length === 1) {
      return ret += fillZero(binaryString(item), 4)
    }

  }, startCode);

  return getEndCode(strcode);
}

function AlphanumericMode(str, version) {
  // 将每两个字符分为一组，然后转成上 45 进制，再转为 11bits 的二进制结果。对于落单的一个字符，则转为 6bits 的二进制结果
  let endchar = '',
    len = str.length,
    startCode = getStartCode(version, len, MODE_Alphanumeric);

  let arr = str.split('')
  if (len % 2 === 1) {
    endchar = arr.pop();
  }

  let temp = 0;
  let strcode = arr.reduce((ret, item, index) => {

    value = charValue(item);

    if (index % 2 === 0) {
      temp = 0;
      temp += (value * 45);
      return ret;
    } else {
      temp += value;
      return ret += fillZero(binaryString(temp), 11);
    }
  }, startCode);

  if (endchar.length === 1)
    strcode += fillZero(binaryString(charValue(endchar)), 6);

  return getEndCode(strcode);
}

console.log(AlphanumericMode('AE-86', 1))
console.log(AlphanumericMode('HELLO WORLD', 1))
console.log(NumericMode('01234567', 1))