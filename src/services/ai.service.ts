
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function getYouTubeSummary(videoUrl: string): Promise<string> {
    const videoId = new URL(videoUrl).searchParams.get('v');
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            part: 'snippet',
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
        },
    });

    const video = response.data.items[0];
    const textToSummarize = `${video.snippet.title} ${video.snippet.description}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Please provide a detailed summary of the following content, including all key points and relevant details, in a human-readable format:\n\n${textToSummarize}`);
    return result.response.text();
}

async function getTwitterSummary(tweetUrl: string): Promise<string> {
    const tweetId = new URL(tweetUrl).pathname.split('/').pop();
    if (!tweetId) {
        throw new Error('Invalid Twitter URL');
    }

    const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
        headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
    });

    const textToSummarize = response.data.data.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Please provide a detailed summary of the following content, including all key points and relevant details, in a human-readable format:\n\n${textToSummarize}`);
    return result.response.text();
}

async function getGitHubSummary(repoUrl: string): Promise<string> {
    const [owner, repo] = new URL(repoUrl).pathname.split('/').slice(1);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const headers = {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
    };

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });

    const textToSummarize = `${response.data.description} ${Buffer.from(readmeResponse.data.content, 'base64').toString()}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Please provide a detailed summary of the following content, including all key points and relevant details, in a human-readable format:\n\n${textToSummarize}`);
    return result.response.text();
}

export async function generateSummary(source: string, link: string): Promise<string> {
    switch (source) {
        case 'youtube':
            return getYouTubeSummary(link);
        case 'twitter':
            return getTwitterSummary(link);
        case 'github':
            return getGitHubSummary(link);
        default:
            return '';
    }
}
