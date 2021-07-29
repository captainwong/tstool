# tstool

将 `Qt 翻译文件 *.ts` 翻译为其他语言的小工具，要求源代码内都是 `tr("some english text")`，不支持 `tr("中文文本")`，且已经做好了中文的翻译即已经有 `zh_CN.ts`。

基于百度翻译，将条目以中文翻译为目标语言。

## 支持的目标语言

```js
const dst_langs = {
    'zh_TW': 'cht', // 繁体中文
    'ar': 'ara',    // 阿拉伯语
    'de': 'de',     // 德语
    'es': 'spa',    // 西班牙语
    'fr': 'fra',    // 法语
    'it': 'it',     // 意大利语
    'pt': 'pt',     // 葡萄牙语
    'ru': 'ru',     // 俄语
};
```

## 用法
`node index.js -z 中文ts文件 -d 目标语言列表`

## 示例

```bash
export BAIDU_APP_ID=你的百度翻译appid
export BAIDU_APP_SECRET=你的百度翻译app_secret
# 根据 helloworld_zh_cn.ts 内的中文翻译，翻译为 helloworld_zh_TW.ts 和 helloworld_fr.ts
node index.js -z ../helloworld_zh_cn.ts -d zh_TW fr
```

## 参考
* [百度翻译文档](https://fanyi-api.baidu.com/doc/21)
* [基于百度翻译API的node插件](https://blog.csdn.net/qq_42036203/article/details/113062307)
* [esutton/i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts)


ps: 作者 js 小白一个，代码写的渣渣无比，仅仅能用，多多包涵，欢迎改进。

