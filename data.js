const ALPHA_NUM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

const MODE_TERMINATOR = 0b0000; // 0
const MODE_NUMER = 0b0001; //1 - 
const MODE_ALPHA_NUMER = 0b0010; //2 - 
const MODE_Structured_Append = 0b0011; //3
const MODE_8Bit_BYTE = 0b0100; //4 - 
const MODE_FNC1_1 = 0b0101; //5
const MODE_ECI = 0b0111; //7
const MODE_KANJI = 0b1000; //8 - 
const MODE_FNC1_2 = 0b1001; //9
const MODE_CHINESE = 0b1101; //13

const LEVEL_L = 0b01; //1 - 0
const LEVEL_M = 0b00; //0 - 1
const LEVEL_Q = 0b11; //3 - 2
const LEVEL_H = 0b10; //2 - 3

const MASK_0 = 0b000; // (i+j) % 2 = 0
const MASK_1 = 0b001; // i % 2 = 0
const MASK_2 = 0b010; // j % 3 = 0
const MASK_3 = 0b011; // (i+j) % 3 = 0
const MASK_4 = 0b100; // (i/2 + j/3) % 2 = 0
const MASK_5 = 0b101; // ij % 2 + ij % 3 = 0
const MASK_6 = 0b110; // (ij % 2 + ij % 3) % 2 = 0
const MASK_7 = 0b111; // (ij % 3 + (i+j) % 2) % 2 = 0

const G15 = 1335;
const G18 = 7973;
const G15_MASK = 21522;
const G15_BCH = getBCHDigit(G15);

//  每个版本对应的 二维码纠错级别 - 需要划分纠错块的个数 Number of Error correction blocks
const EC_BLOCKS = [
  // L  M  Q  H
  0, 0, 0, 0, // there is no version 0
  1, 1, 1, 1, // version 1
  1, 1, 1, 1, // version 2
  1, 1, 2, 2,
  1, 2, 2, 4,
  1, 2, 4, 4, //5
  2, 4, 4, 4,
  2, 4, 6, 5,
  2, 4, 6, 6,
  2, 5, 8, 8,
  4, 5, 8, 8, //10
  4, 5, 8, 11,
  4, 8, 10, 11,
  4, 9, 12, 16,
  4, 9, 16, 16,
  6, 10, 12, 18, //15
  6, 10, 17, 16,
  6, 11, 16, 19,
  6, 13, 18, 21,
  7, 14, 21, 25,
  8, 16, 20, 25, //20
  8, 17, 23, 25,
  9, 17, 23, 34,
  9, 18, 25, 30,
  10, 20, 27, 32,
  12, 21, 29, 35, //25
  12, 23, 34, 37,
  12, 25, 34, 40,
  13, 26, 35, 42,
  14, 28, 38, 45,
  15, 29, 40, 48, //30
  16, 31, 43, 51,
  17, 33, 45, 54,
  18, 35, 48, 57,
  19, 37, 51, 60,
  19, 38, 53, 63, //35
  20, 40, 56, 66,
  21, 43, 59, 70,
  22, 45, 62, 74,
  24, 47, 65, 77,
  25, 49, 68, 81 //40
];
//  每个版本对应的 二维码纠错级别 - 纠错码个数 Number of Error correction codewords
const EC_CODEWORDS = [
  // L  M  Q  H
  0, 0, 0, 0, // there is no version 0
  7, 10, 13, 17, // version 1
  10, 16, 22, 28, // version 2
  15, 26, 36, 44,
  20, 36, 52, 64,
  26, 48, 72, 88,
  36, 64, 96, 112,
  40, 72, 108, 130,
  48, 88, 132, 156,
  60, 110, 160, 192,
  72, 130, 192, 224,
  80, 150, 224, 264,
  96, 176, 260, 308,
  104, 198, 288, 352,
  120, 216, 320, 384,
  132, 240, 360, 432,
  144, 280, 408, 480,
  168, 308, 448, 532,
  180, 338, 504, 588,
  196, 364, 546, 650,
  224, 416, 600, 700,
  224, 442, 644, 750,
  252, 476, 690, 816,
  270, 504, 750, 900,
  300, 560, 810, 960,
  312, 588, 870, 1050,
  336, 644, 952, 1110,
  360, 700, 1020, 1200,
  390, 728, 1050, 1260,
  420, 784, 1140, 1350,
  450, 812, 1200, 1440,
  480, 868, 1290, 1530,
  510, 924, 1350, 1620,
  540, 980, 1440, 1710,
  570, 1036, 1530, 1800,
  570, 1064, 1590, 1890,
  600, 1120, 1680, 1980,
  630, 1204, 1770, 2100,
  660, 1260, 1860, 2220,
  720, 1316, 1950, 2310,
  750, 1372, 2040, 2430
];

// 每个版本对应的 码字总个数 - total number of codewords
const CODEWORDS_COUNT = [
  0, // there is no version 0
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
  404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
  1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
  2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
];

const ROWCOLCOORDS = [
  [], // no version 0
  [], // version 1
  [6, 18], // version 2;
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
];



function getMaskAt(mode, i, j) {
  switch (mode) {
    case MASK_0:
      {
        return (i + j) % 2 == 0
      }
      break;
    case MASK_1:
      {
        return i % 2 == 0
      }
      break;
    case MASK_2:
      {
        return j % 3 == 0
      }
      break;
    case MASK_3:
      {
        return (i + j) % 3 == 0
      }
      break;
    case MASK_4:
      {
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0
      }
      break;
    case MASK_5:
      {
        return (i * j) % 2 + (i * j) % 3 == 0
      }
      break;
    case MASK_6:
      {
        return ((i * j) % 2 + (i * j) % 3) % 2 == 0
      }
      break;
    case MASK_7:
      {
        return ((i * j) % 3 + (i + j) % 2) % 2 == 0
      }
  }

}

/**
 * Encode data with Bose-Chaudhuri-Hocquenghem
 *
 * @param  {Number} data Value to encode
 * @return {Number}      Encoded value
 */
function getBCHDigit(data) {
  var digit = 0

  while (data !== 0) {
    digit++
    data >>>= 1
  }

  return digit
}

// 校正图形（Alignment Patterns）：只有Version 2以上（包括Version2）的二维码需要这个东东?


module.exports = {
  ALPHA_NUM_CHARS,
  LEVEL_L,
  LEVEL_M,
  LEVEL_Q,
  LEVEL_H,
  MASK_0,
  MASK_1,
  MASK_2,
  MASK_3,
  MASK_4,
  MASK_5,
  MASK_6,
  MASK_7,
  getMaskAt,
  EC_BLOCKS,
  EC_CODEWORDS,
  CODEWORDS_COUNT,
  ROWCOLCOORDS,
  G15,
  G15_MASK,
  G18
}