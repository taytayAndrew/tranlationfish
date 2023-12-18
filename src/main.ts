import md5 from 'md5';
import * as https from 'node:https';
import * as querystring from 'querystring'
import { appSecret, appId } from './private';

type ErrorMap = {//使得errorMap可以得到任意字符串作为key
    [key: string]: string
}
const errorMap: ErrorMap = {//利用表驱动编程 来简化if else
    52003: '用户认证失败',
    54001: '签名错误',
    54004: '账户余额不足',
};
export const translate = (word: string) => {
    const salt = Math.random()//随机数
    const sign = md5(appId + word + salt + appSecret)//这些数值组合后进行md5字符转换
    let from, to;
    if (/[a-zA-Z]/.test(word[0])) {
        // 英译为中
        from = 'en';
        to = 'zh';
    } else {
        // 中译为英
        from = 'zh';
        to = 'en';
    }
    const query: string = querystring.stringify({
        q: word, appid: appId, salt, sign, from, to,
    })
    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET',
    };

    const req = https.request(options, (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => {
            chunks.push(chunk)
        })

        response.on('end', () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                error_code?: string;
                error_msg?: string;
                from: string;
                to: string;
                trans_result: { src: string; dst: string; }[]
            }
            const object: BaiduResult = JSON.parse(string)
            if (object.error_code) {
                console.log(errorMap[object.error_code] || object.error_msg)
                process.exit(2)
            } else {
                (object.trans_result.map(obj => {
                    console.log(obj.dst)
                }))
                process.exit(0)

            }
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}
