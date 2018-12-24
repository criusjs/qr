# [qr](https://blog.csdn.net/ajianyingxiaoqinghan/article/details/78837864)

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

