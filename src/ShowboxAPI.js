import CryptoJS from 'crypto-js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdef', 32);

const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/',
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
    DEFAULTS: {
        CHILD_MODE: '0', APP_VERSION: '11.5', LANG: 'en',
        PLATFORM: 'android', CHANNEL: 'Website', APPID: '27',
        VERSION: '129', MEDIUM: 'Website',
    },
};

export default class ShowboxAPI {
    encrypt(data) {
        return CryptoJS.TripleDES.encrypt(
            data, CryptoJS.enc.Utf8.parse(CONFIG.KEY), { iv: CryptoJS.enc.Utf8.parse(CONFIG.IV) }
        ).toString();
    }

    generateVerify(encryptedData) {
        return CryptoJS.MD5(CryptoJS.MD5(CONFIG.APP_KEY).toString() + CONFIG.KEY + encryptedData).toString();
    }

    async request(module, params = {}) {
        const requestData = {
            ...CONFIG.DEFAULTS,
            expired_date: Math.floor(Date.now() / 1000 + 60 * 60 * 12),
            module, ...params,
        };

        const encryptedData = this.encrypt(JSON.stringify(requestData));
        const body = JSON.stringify({
            app_key: CryptoJS.MD5(CONFIG.APP_KEY).toString(),
            verify: this.generateVerify(encryptedData),
            encrypt_data: encryptedData,
        });

        const formData = new URLSearchParams({
            data: btoa(body), // Native browser base64 encoding instead of Buffer
            appid: CONFIG.DEFAULTS.APPID, platform: CONFIG.DEFAULTS.PLATFORM,
            version: CONFIG.DEFAULTS.VERSION, medium: CONFIG.DEFAULTS.MEDIUM,
        });

        const response = await fetch(CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Platform': CONFIG.DEFAULTS.PLATFORM,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/3.2.0',
            },
            body: `${formData.toString()}&token${nanoid()}`,
        });
        return response.json();
    }

    async search(title, type = 'all', page = 1, pagelimit = 20) {
        const data = await this.request('Search5', { page, type, keyword: title, pagelimit });
        return data?.data || [];
    }

    async getFebBoxId(id, type) {
        const response = await fetch(`https://www.showbox.media/index/share_link?id=${id}&type=${type}`);
        const data = await response.json();
        return data?.data?.link?.split('/').pop();
    }
}
