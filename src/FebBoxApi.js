export default class FebboxAPI {
    constructor() {
        this.baseUrl = 'https://www.febbox.com';
        this.headers = {
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        };
    }

    _setAuthCookie(cookie) {
        if (cookie) this.headers.cookie = `ui=${cookie.trim()}`;
        return this;
    }

    async _fetchJson(url) {
        const response = await fetch(url, { headers: this.headers });
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
        return response.json();
    }

    async getFileList(shareKey, parentId = 0) {
        const url = `${this.baseUrl}/file/file_share_list?share_key=${shareKey}&pwd=&parent_id=${parentId}&is_html=0`;
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
        const data = await this._fetchJson(url);
        return data.data.file_list;
    }

    async getLinks(shareKey, fid) {
        const url = `${this.baseUrl}/console/video_quality_list?fid=${fid}`;
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
        const data = await this._fetchJson(url);
        
        const results = [];
        const blocks = data.html.split('class="file_quality"');
        
        // Helper to strip HTML tags and newlines
        const stripTags = (str) => str ? str.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : '';
        
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const urlMatch = block.match(/data-url="([^"]+)"/);
            const qualityMatch = block.match(/data-quality="([^"]+)"/);
            const nameMatch = block.match(/class="name"[^>]*>([\s\S]*?)<\/div>/);
            const speedMatch = block.match(/class="speed"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/);
            const sizeMatch = block.match(/class="size"[^>]*>([\s\S]*?)<\/div>/);

            if (urlMatch) {
                results.push({
                    url: urlMatch[1],
                    quality: qualityMatch ? qualityMatch[1] : 'Unknown',
                    name: stripTags(nameMatch ? nameMatch[1] : ''),
                    speed: stripTags(speedMatch ? speedMatch[1] : ''),
                    size: stripTags(sizeMatch ? sizeMatch[1] : '')
                });
            }
        }
        return results;
    }
}
