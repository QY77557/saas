export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { source, siteName, siteId } = req.body;
    if (!source) {
        return res.status(400).json({ error: '源码不能为空' });
    }
    
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: '服务器配置错误' });
    }
    
    try {
        const gistRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: `站点: ${siteName} - ${siteId}`,
                public: true,
                files: {
                    [`${siteId}.html`]: { content: source }
                }
            })
        });
        
        const data = await gistRes.json();
        
        if (data.id) {
            const publicUrl = `/user.html?view=${data.id}`;
            res.json({ success: true, url: publicUrl, gistId: data.id });
        } else {
            res.json({ error: data.message || '发布失败' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}api/
