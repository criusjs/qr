const MODE_Terminator = 0b0000; // 0
const MODE_Numeric = 0b0001; //1 - 
const MODE_Alphanumeric = 0b0010; //2 - 
const MODE_Structured_Append = 0b0011; //3
const MODE_8BIT = 0b0100; //4 - 
const MODE_FNC1_1 = 0b0101; //5
const MODE_ECI = 0b0111; //7
const MODE_Kanji = 0b1000; //8 - 
const MODE_FNC1_2 = 0b1001; //9

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

function fillZero(str, length) {
  let len = length - str.length;
  for (let index = 0; index < len; index++) {
    str = `0${str}`;
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
  return fillZero(code, 8 - code % 8);
}

function NumericMode(str, version) {
  // 将每两个字符分为一组，然后转成上 45 进制，再转为 11bits 的二进制结果。对于落单的一个字符，则转为 6bits 的二进制结果
  let endchar = '',
    len = str.length,
    startCode = getStartCode(version, len, MODE_Numeric);
  let arr = str.match(/\d{2,3}/g);

  let strcode = arr.reduce((ret, item) => {
    if (item.length % 3 === 0) {
      return ret += fillZero(binaryString(item), versionBits(version, MODE_Numeric))
    } else if (item.length % 3 === 1) {
      return ret += fillZero(binaryString(item), 4)
    } else if (item.length % 3 === 2) {
      return ret += fillZero(binaryString(item), 8)
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
console.log(AlphanumericMode('CHANDLERGENG', 1))
console.log(NumericMode('01234567', 1))