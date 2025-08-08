
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Proxy cover art images to avoid CORS issues
router.get('/cover/:mbid', async (req: Request, res: Response) => {
    const { mbid } = req.params;
    const url = `https://coverartarchive.org/release/${mbid}/front`;
    console.log(`[COVER] Proxying cover art for MBID: ${mbid}`);
    try {
        const response = await fetch(url);
        console.log(`[COVER] Fetched ${url} - status: ${response.status}`);
        if (!response.ok) {
            console.error(`[COVER] Not found: ${url}`);
            return res.status(response.status).send('Not found');
        }
        res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        if (response.body) {
            console.log(`[COVER] Streaming image data for MBID: ${mbid}`);
            response.body.pipe(res);
        } else {
            console.error(`[COVER] No image data for MBID: ${mbid}`);
            res.status(500).send('No image data');
        }
    } catch (e) {
        console.error(`[COVER] Error fetching cover for MBID: ${mbid}`, e);
        res.status(500).send('Error fetching cover');
    }
});

export default router;
