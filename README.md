# [qr](https://blog.csdn.net/ajianyingxiaoqinghan/article/details/78837864)
[](http://www.cnblogs.com/xxaxx/p/3416450.html)
[--](https://github.com/alexeyten/qr-image)
[](https://www.cnblogs.com/sky-heaven/p/6841901.html)
https://blog.csdn.net/weiwei9363/article/details/81112795
[](https://www.thonky.com/qr-code-tutorial/error-correction-table)
#### 基础编码

- 数据码 = 编码 + 字符号 + 内容编码 + 结束符 + 补齐符

- 数据码 ... slice ...block

- block + 纠错码 + 剩余位

数据编码模式 表
字符计数指示器中的位数 表
编码图表
字符编码图表 0-9A-Z
结束符 0000
补齐符规则：8的倍数，不足补0

#### 定位 + 对齐 + 时序

