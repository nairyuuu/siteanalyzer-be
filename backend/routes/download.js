require('dotenv').config();  // Load environment variables from .env file

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// Get GitHub token and repo details from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH;

if (!GITHUB_TOKEN || !OWNER || !REPO || !BRANCH) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH');
}

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const ZIP_PATH = path.join(__dirname, 'shared', 'site-analyzer-main.zip');
const HEAD_FILE = path.join(__dirname, 'shared', 'last_commit_sha.txt');

async function getLatestCommitSha() {
    try {
        const res = await axios.get(`${API_BASE}/commits/${BRANCH}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });
        return res.data.sha;
    } catch (error) {
        console.error('Error fetching latest commit SHA:', error.response?.data || error.message);
        throw new Error('Failed to fetch latest commit SHA.');
    }
}

async function checkAndUpdateRepo() {
    try {
        const latestSha = await getLatestCommitSha();
        const storedSha = fs.existsSync(HEAD_FILE) ? fs.readFileSync(HEAD_FILE, 'utf8') : null;

        if (latestSha !== storedSha || !fs.existsSync(ZIP_PATH)) {
            console.log('Repository has been updated. Downloading new ZIP...');
            await downloadRepoZip();
            fs.writeFileSync(HEAD_FILE, latestSha);
        } else {
            console.log('Repository is up-to-date. No download needed.');
        }
    } catch (error) {
        console.error('Error checking and updating repository:', error.message);
        throw error;
    }
}

async function downloadRepoZip() {
    try {
        const zipUrl = `${API_BASE}/zipball/${BRANCH}`;
        const res = await axios.get(zipUrl, {
            responseType: 'stream',
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });

        // Save the ZIP file to the specified path
        const writer = fs.createWriteStream(ZIP_PATH);
        await new Promise((resolve, reject) => {
            res.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading repository ZIP:', error.response?.data || error.message);
        throw new Error('Failed to download repository ZIP.');
    }
}

// Main route
router.get('/', async (req, res) => {
    try {
        // Check and update the repository if needed
        await checkAndUpdateRepo();

        // Send the ZIP file to the user
        res.download(ZIP_PATH, 'extension.zip');
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;