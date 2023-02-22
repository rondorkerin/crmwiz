/**
import express from 'express';
import axios from 'axios';
import { URLSearchParams } from 'url';

const router = express.Router();

const CLIENT_ID = '<your Salesforce app client id>';
const CLIENT_SECRET = '<your Salesforce app client secret>';
const REDIRECT_URI = '<your redirect URI>';
const AUTH_URL = 'https://login.salesforce.com/services/oauth2/authorize';
const TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

// Route for redirecting to Salesforce OAuth login page
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });

  const authUrl = `${AUTH_URL}?${params.toString()}`;
  res.redirect(authUrl);
});

// Route for handling OAuth callback and exchanging code for access token
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });

  try {
    const { data } = await axios.post(TOKEN_URL, params);
    const { access_token, instance_url } = data;

    // Store the access token and instance URL in session or database for future use
    req.session.accessToken = access_token;
    req.session.instanceUrl = instance_url;

    res.redirect('/'); // Redirect to home page or desired route
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to obtain access token');
  }
});

// Route for accessing Salesforce API with access token
router.get('/api', async (req, res) => {
  const { accessToken, instanceUrl } = req.session;
  if (!accessToken || !instanceUrl) {
    return res.status(401).send('Access token not found');
  }

  const apiUrl = `${instanceUrl}/services/data/v52.0/query/?q=SELECT+Id,Name+FROM+Account`;
  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const { data } = await axios.get(apiUrl, { headers });
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to access Salesforce API');
  }
});

export default router;

 */
