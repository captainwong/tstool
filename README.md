# tstool

将 Qt 翻译文件 *.ts 翻译为其他语言的小工具，要求源代码内都是 ts("英文")，且已经做好了中文的翻译即已经有zh_CN.ts。
基于百度翻译，将条目的中文翻译为目标语言

## 用法
`npm index.js -z 中文ts 目标语言ts 源语言 目标语言`

源语言只能zh，目标语言可以为繁体中文cht，英文en等，具体参考 [百度翻译文档](https://fanyi-api.baidu.com/doc/21)

## 示例

```bash
node index.js -z ../alarmcenterpro_zh_cn.ts -f ../alarmcenterpro_zh_tw.ts  -s zh -d cht
```

## 参考

* [基于百度翻译API的node插件](https://blog.csdn.net/qq_42036203/article/details/113062307)
* [esutton/i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts)


ps: 作者 js 小白一个，代码写的渣渣无比，仅仅能用，多多包涵。

