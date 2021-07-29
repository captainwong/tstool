
const fs = require('fs');
const md5 = require("md5-node");
const axios = require("axios");

const xmldom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

const { Command, Option } = require('commander');
const program = new Command();


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


console.log(`${process.argv}`)

// 从 zh_CN 中提取的 源语言 =》 中文的列表
var zhMap = new Map();

function MysKeyTranslate(config) {
    this.requestNumber = 0;
    this.config = {
        showProgress: true,
        requestNumber: 1,
        agreement: 'http',
        ...config,
    };
    this.baiduApi = `${this.config.agreement}://api.fanyi.baidu.com/api/trans/vip/translate`

    this.createUrl = (domain, form) => {
        let result = domain + "?";
        for (let key in form) {
            result += `${key}=${form[key]}&`;
        }
        return result.slice(0, result.length - 1);
    };

    this.requestApi = (value, parames) => {
        if (this.requestNumber >= this.config.requestNumber) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.requestApi(value, parames).then((res) => {
                        resolve(res);
                    });
                }, 1000);
            });
        }
        this.requestNumber++;
        const { appid, secret } = this.config;
        const q = value;
        const salt = Math.random();
        const sign = md5(`${appid}${q}${salt}${secret}`);
        const fromData = {
            ...parames,
            q: encodeURIComponent(q),
            sign,
            appid,
            salt,
        };
        const fanyiApi = this.createUrl(this.baiduApi, fromData);
        console.log("fanyiApi", fanyiApi);
        return new Promise((resolve) => {
            axios
                .get(fanyiApi)
                .then(({ data: res }) => {
                    if (this.config.showProgress) console.log("翻译结果：", res);
                    if (!res.error_code) {
                        const resList = res.trans_result;
                        resolve(resList);
                    }
                })
                .finally(() => {
                    setTimeout(() => {
                        this.requestNumber--;
                    }, 1000);
                });
        });
    };

    this.translate = async (value, parames = { from: this.config.from, to: this.config.to }) => {
        let result = "";
        if (typeof value === "string") {
            const res = await this.requestApi(value, parames);
            result = res[0]["dst"];
        }
        if (
            Array.isArray(value) ||
            Object.prototype.toString.call(value) === "[object Object]"
        ) {
            result = await this._createObjValue(value, parames);
        }
        return result;
    };

    this._createObjValue = async (value, parames) => {
        let index = 0;
        const obj = Array.isArray(value) ? [] : {};
        const strDatas = Array.isArray(value) ? value : Object.values(value);
        const reqData = strDatas
            .filter((item) => typeof item === "string")
            .join("\n");
        const res = reqData ? await this.requestApi(reqData, parames) : [];
        for (let key in value) {
            if (typeof value[key] === "string") {
                obj[key] = res[index]["dst"];
                index++;
            }
            if (
                Array.isArray(value[key]) ||
                Object.prototype.toString.call(value[key]) === "[object Object]"
            ) {
                obj[key] = await this.translate(value[key], parames);
            }
        }
        return obj;
    };

    return this.translate;
}

const bdtranslate = new MysKeyTranslate({
    appid: process.env.BAIDU_APP_ID,  // 你的appid  去百度开发者平台查看 http://api.fanyi.baidu.com/doc/21
    secret: process.env.BAIDU_APP_SECRET, // 你的密钥
});

// // 下面就可以直接使用了
// translate('接警中心', { from: "zh", to: 'cht' }).then((res) => {
//   console.log('res', res);
// });


const TranslateStatus = {
    IsUrl: -2,
    IsHtml: -1,
    AlreadyTranslated: 0,
    TranslateFailed: 1,
};

function getAttributeByName(element, name) {
    const attribute = element.getAttributeNode(name);
    if (!attribute) {
        return null;
    }
    return attribute.value;
}

function getElementByName(parent, name) {
    const elementList = parent.getElementsByTagName(name);
    if (!elementList.length) {
        console.warn(`*** tagName not found: '${name}'`);
        return null;
    }
    if (elementList.length > 1) {
        console.warn(
            `*** Found ${elementList.length} elements matching name: ${name}`)
    }
    return elementList[0];
}

function getElementText(node) {
    if (!node) {
        return '';
    }
    if (!node.firstChild) {
        return '';
    }
    return node.firstChild.nodeValue;
}


// If no type is set, the message is "finished".
// http://doc.qt.io/qt-5/linguist-ts-file-format.html
//
// Note: translationType applies only to a pre-existing translation.
// For example, if a human reviewed translation, Google Translate should leave
// it alone.
//
// returns finished or unfinished|vanished|obsolete
function getTranslationType(message, sourceText) {
    const translation = getElementByName(message, 'translation');
    if (!translation) {
        return 'unfinished';
    }

    if (!sourceText) {
        console.warn(`*** translation has no source text to translate: ${sourceText}`)
        return 'finished';
    }

    if (sourceText.length > 0 && translation.firstChild === null) {
        // If sourceText exists but translation is missing
        return 'unfinished';
    }

    const translationType = getAttributeByName(translation, 'type');
    if (!translationType) {
        return 'finished';
    }
    return translationType;
}

function setTranslatedText(doc, message, translationNode, translatedText) {
    if (translationNode === null) {
        translationNode = doc.createElement('translation');
        message.appendChild(translationNode);
        translationNode.setAttribute('type', 'unfinished');
    }

    let textNode = translationNode.firstChild;
    if (textNode == null) {
        textNode = doc.createTextNode(translatedText);
        translationNode.appendChild(textNode);
    } else {
        textNode.nodeValue = translatedText;
    }
    translationNode.setAttribute('type', 'finished');
}

// Translate text from message/source message/translation
//
// ToDo: Handle XML special characters '&lt;'
// ToDo: Split by %
// ToDo: If all % args, then skip translate
// ToDo: If all numbers, then skip translate
//
// Challenges:
// -------------------------
// translate: '&lt;- Back'
// translate: 'Send To:  %1'
// translate: '-100'
// translate: '+100'
// translate: 'Attachment(s): %n'
// translate: 'Error creating PDF file %1'
// translate: '%1: %2, %3 %4, %5 %6'
//
function messageTranslate(contextName, targetLanguage, doc, message, callback) {
    let translateApiCallCount = 0;
    // console.log('dbg: message:', message);
    const source = getElementByName(message, 'source');

    let translationNode = getElementByName(message, 'translation');
    // console.log(`dbg: messageTranslate source "${source.firstChild.nodeValue}"`);
    // console.log(`dbg: messageTranslate translationNode "${
    //     translationNode.childNodes[0]}"`);
    // console.log(
    //     'dbg: messageTranslate translationNode.firstChild',
    //     translationNode.firstChild);

    const sourceText = getElementText(source);    

    // translationType applies only to a pre-existing translation
    const translationType = getTranslationType(message, sourceText);
    // console.log(`dbg: messageTranslate translationType "${translationType}"`);
    if (translationType === 'finished') {
        console.log(
           `finished skipping '${sourceText}'`);
        callback(TranslateStatus.AlreadyTranslated, sourceText);
        return translateApiCallCount;
    }

    // passthrough if contains HTML
    if (/<[a-z][\s\S]*>/i.test(sourceText) == true) {
        console.warn(`'*** Warning: text detected as html: ${sourceText}`);
        callback(TranslateStatus.IsHtml, sourceText);
        return translateApiCallCount;
    }

    // it is just a url
    if (sourceText.indexOf("http://") == 0 && sourceText.indexOf(" ") < 0) {
        console.warn(`'*** Warning: text detected as url: ${sourceText}`);
        callback(TranslateStatus.IsUrl, sourceText);
        return translateApiCallCount;
    }

    console.log(
         `translate text '${sourceText}' from zh_CN to '${targetLanguage}'`);

    // fire the google translation
    translateApiCallCount += 1;

    bdtranslate(zhMap.get(contextName + '.' + sourceText), { from: 'zh', to: dst_langs[targetLanguage] })
        .then(function (res) {
            console.log(res);
            
            // Fix Google Translate "%1" to "% 1".
            // Example:
            // Source.......: "Send To:  %1"
            // Translates to: 'Enviar a:% 1'
            // Fix..........: 'Enviar a:%1'
            if (res.indexOf('% ') >= 0) {
                console.log(`dbg Fix Qt args b4 :'${res}'`);
                res = res.replace(/(\%)\s(?=\d)/g, ' $1')
                console.log(`dbg Fix Qt args aft:'${res}'`);
            }

            // return the translated text
            console.log(`translated '${sourceText}' to '${res}'`);

            if (translationNode === null) {
                translationNode = doc.createElement('translation');
                message.appendChild(translationNode);
                translationNode.setAttribute('type', 'unfinished');
            }

            let textNode = translationNode.firstChild;
            if (textNode == null) {
                textNode = doc.createTextNode(res);
                translationNode.appendChild(textNode);
            } else {
                textNode.nodeValue = res;
            }

            translationNode.setAttribute('type', 'finished');

            callback(null, res);
        })
        .catch(err => console.log(`Error on bdtranslate: ${err}`));

    return translateApiCallCount;
}

function translateToFile(dstFile, targetLanguage) {
    console.log('-------------translating ' + dstFile + '------------');
    fs.readFile(dstFile, 'utf-8', function (err, data) {
        if (err) {
            throw err;
        }
        const doc = new xmldom().parseFromString(data, 'application/xml');
        //const tsElement = doc.getElementsByTagName('TS')[0];
   
        console.log('targetLanguage:', targetLanguage);

        const promises = [];
        const contextList = doc.getElementsByTagName('context');
        for (let i = 0; i < contextList.length; i += 1) {
            const context = contextList[i];
            const contextName = getElementText(getElementByName(context, 'name'));
            const messageList = context.getElementsByTagName('message');
            for (let j = 0; j < messageList.length; j += 1) {
                const message = messageList[j];
                promises.push(new Promise((resolve, reject) => {
                    // Translate text from message/source message/translation
                    messageTranslate(
                        contextName, targetLanguage, doc, message, function (err, translation) {
                            if (err > 0) {
                                console.error(`** Error messageTranslate to '${language}' failed err:${err}`);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                }));
                //console.log(message);
                //break;
            }
            //break;
        }  // end for context

        //Set timeout if a translation fail to complete
        //promises.push(new Promise((resolve, reject) => setTimeout(() => reject(1), 1 * 60 * 1000)));

        //When all strings are translated, write the translations to file
        Promise.all(promises)
            .then(() => {
                console.log('Promise.all done writing', dstFile);
                const xml = new XMLSerializer().serializeToString(doc);
                fs.writeFile(dstFile, xml, function (err) {
                    if (err) {
                        // console.log(err);
                        return console.log(err);
                    }
                });
            })
            .catch(err => console.log(`*** Error Promise.all writing ${dstFile} \n${err}`));
    });
}

function translateQtTsFile(zh_ts, dsts) {

    const pos = zh_ts.indexOf('_');
    if(pos < 0){
        console.error('Error parse name from zh ts');
        return;
    }

    const projectname = zh_ts.substring(0, pos);
    //console.log(projectname);
   // return;

    fs.readFile(zh_ts, 'utf-8', function(err, data){
        if (err) {
            throw err;
        }        
        const doc = new xmldom().parseFromString(data, 'application/xml');
        const contextList = doc.getElementsByTagName('context');
        for (let i = 0; i < contextList.length; i += 1) {
            const context = contextList[i];
            const contextName = getElementText(getElementByName(context, 'name'));
            //console.log('contextName=', contextName);
            //continue;
            const messageList = context.getElementsByTagName('message');
            for (let j = 0; j < messageList.length; j += 1) {
                const message = messageList[j];
                const source = getElementByName(message, 'source');

                let translationNode = getElementByName(message, 'translation');
                // console.log(`dbg: messageTranslate source "${source.firstChild.nodeValue}"`);
                // console.log(`dbg: messageTranslate translationNode "${
                //     translationNode.childNodes[0]}"`);
                //console.log(
                //    'dbg: messageTranslate translationNode.firstChild',
                //    translationNode.firstChild);

                const sourceText = getElementText(source);    
                const destinationText = getElementText(translationNode);

                //console.log(`'${sourceText}' => '${destinationText}'`);

                zhMap.set(contextName + '.' + sourceText, destinationText);
                //console.log(zhMap.size);
                // zhMap.forEach(function (item, key, mapObj) {
                //     console.log(item);
                //     console.log(key, '=>', mapObj.get(key));
                // });
            }
        }  // end for context


        console.log('zhMap.size');
        console.log(zhMap.size);
        zhMap.forEach(function (item, key, mapObj) {
                //console.log(item);
                console.log(key, '=>', mapObj.get(key));
            });

        const promises = [];
        for (const dst of dsts){
            const dstFile = projectname + "_" + dst + ".ts"; // e.g. helloworld_fr.ts
            promises.push(new Promise((resolve, reject) => {
                // Translate text from message/source message/translation
                translateToFile(dstFile, dst);
                resolve();
            }));            
        }
        Promise.all(promises);
    });
    
    

    return;

    
    
}

program
    .requiredOption('-z, --zhfile <string>', 'zh ts file to be parsed')
    //.requiredOption('-f, --file <string>', 'ts file to be parsed')
    //.option('-s, --src <string>', 'source language, can be language of ts file, or language of ts original(normally its source code language and its en)', 'en')
    .addOption(new Option('-d, --dsts <string...>', 'destination languages')
                    .choices(Array.from(Object.keys(dst_langs))));


program.parse();
const opts = program.opts();
//console.log(`opts.file=${opts.file}, src=${opts.src}, dst=${opts.dst}`);
//console.log(dst_langs['ar']);
//return;
translateQtTsFile(opts.zhfile, opts.dsts);
