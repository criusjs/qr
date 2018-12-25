const Data = require('./data')

const MODE_NUMERIC = 0b0001; //1 - 
const MODE_ALPHANUMERIC = 0b0010; //2 - 


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

// 
// 结束符 + 按8bits重排
function getEndCode(bcode) {
  bcode += '0000';
  return fillZero(bcode, Math.ceil(bcode.length / 8.0) * 8, true);
}
// 
// 补齐码（ Padding Bytes）
function getPaddingCode(bcode, version) {
  let requireLen = Data.CODEWORDS_COUNT[version],
    len = bcode.length / 8;
  console.log('==', requireLen, len)
  for (let index = 0; index < requireLen - len; index++) {
    if (index % 2 === 0) bcode += '11101100';
    else if (index % 2 === 1) bcode += '00010001';
  }

  return bcode;
}

function NumericMode(str, version) {
  // 将每两个字符分为一组，然后转成上 45 进制，再转为 11bits 的二进制结果。对于落单的一个字符，则转为 6bits 的二进制结果
  let endchar = '',
    len = str.length,
    startCode = getStartCode(version, len, MODE_NUMERIC);
  let arr = str.match(/\d{2,3}/g);

  let strcode = arr.reduce((ret, item) => {
    if (item.length === 3) {
      return ret += fillZero(binaryString(item), versionBits(version, MODE_NUMERIC))
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
    startCode = getStartCode(version, len, MODE_ALPHANUMERIC);

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

  // return strcode;
  let b8bits = getEndCode(strcode);
  return getPaddingCode(b8bits, version);
}

console.log(NumericMode('01234567', 1))

let content = AlphanumericMode('HELLO WORLD', 1);
let r = content.match(/\d{8}/g);
let ret = r.map(item => {
  return parseInt(item, 2)
})

console.log(content, content.length, ret)