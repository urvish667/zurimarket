import { API_URL } from '../config';

/**
 * Get all active challenge tiers (public)
 * @returns {Promise<Array>} List of challenge tiers
 */
export const getChallengeTiers = async () => {
    const response = await fetch(`${API_URL}/v0/challenges/tiers`);
    if (!response.ok) {
        throw new Error(`Failed to fetch challenge tiers: ${response.status}`);
    }
    return await response.json();
};

/**
 * Get a single challenge tier by slug (public)
 * @param {string} slug - Tier slug (rookie, prospect, all-star, legend)
 * @returns {Promise<Object>} Challenge tier details
 */
export const getChallengeTierBySlug = async (slug) => {
    const response = await fetch(`${API_URL}/v0/challenges/tiers/${slug}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch tier: ${response.status}`);
    }
    return await response.json();
};

/**
 * Start a new challenge
 * @param {string} token - JWT auth token
 * @param {string} tierSlug - Slug of the challenge tier to start
 * @returns {Promise<Object>} Created challenge
 */
export const startChallenge = async (token, tierSlug) => {
    const response = await fetch(`${API_URL}/v0/challenges/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tierSlug }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to start challenge: ${response.status}`);
    }
    return await response.json();
};

/**
 * Get user's active challenge (max 1)
 * @param {string} token - JWT auth token
 * @returns {Promise<Object|null>} Active challenge or null
 */
export const getActiveChallenge = async (token) => {
    const response = await fetch(`${API_URL}/v0/challenges/active`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch active challenge: ${response.status}`);
    }
    return await response.json();
};

/**
 * Get user's challenge history
 * @param {string} token - JWT auth token
 * @returns {Promise<Array>} Past challenges
 */
export const getChallengeHistory = async (token) => {
    const response = await fetch(`${API_URL}/v0/challenges/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch challenge history: ${response.status}`);
    }
    return await response.json();
};

/**
 * Get challenge detail with daily logs
 * @param {string} token - JWT auth token
 * @param {number} id - Challenge ID
 * @returns {Promise<Object>} Challenge with dailyLogs, progressPct, remainingDays
 */
export const getChallengeDetail = async (token, id) => {
    const response = await fetch(`${API_URL}/v0/challenges/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch challenge detail: ${response.status}`);
    }
    return await response.json();
};

/**
 * Retry a failed/expired challenge
 * @param {string} token - JWT auth token
 * @param {number} id - Challenge ID to retry
 * @returns {Promise<Object>} New challenge attempt
 */
export const retryChallenge = async (token, id) => {
    const response = await fetch(`${API_URL}/v0/challenges/${id}/retry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to retry challenge: ${response.status}`);
    }
    return await response.json();
};
