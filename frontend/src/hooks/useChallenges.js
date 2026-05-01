import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../helpers/AuthContent';
import {
    getChallengeTiers,
    getActiveChallenge,
    getChallengeHistory,
    getChallengeDetail,
    startChallenge as startChallengeApi,
    retryChallenge as retryChallengeApi,
} from '../api/challengesApi';

/**
 * Hook for the main challenges hub: tiers, active challenge, and history.
 */
export function useChallenges() {
    const { isLoggedIn, token } = useAuth();
    const [tiers, setTiers] = useState([]);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tiersData = await getChallengeTiers();
            setTiers(tiersData || []);

            if (isLoggedIn && token) {
                const active = await getActiveChallenge(token);
                setActiveChallenge(active);

                const hist = await getChallengeHistory(token);
                setHistory(hist || []);
            } else {
                setActiveChallenge(null);
                setHistory([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, token]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const startChallenge = async (tierSlug) => {
        try {
            const result = await startChallengeApi(token, tierSlug);
            setActiveChallenge(result);
            return result;
        } catch (err) {
            throw err;
        }
    };

    const retry = async (challengeId) => {
        try {
            const result = await retryChallengeApi(token, challengeId);
            setActiveChallenge(result);
            // Remove from history
            setHistory(prev => prev.filter(c => c.id !== challengeId));
            return result;
        } catch (err) {
            throw err;
        }
    };

    return {
        tiers,
        activeChallenge,
        history,
        loading,
        error,
        startChallenge,
        retryChallenge: retry,
        refresh: fetchAll,
    };
}

/**
 * Hook for a single challenge detail view with daily logs.
 */
export function useChallengeDetail(challengeId) {
    const { isLoggedIn, token } = useAuth();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!challengeId || !isLoggedIn || !token) {
            setChallenge(null);
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getChallengeDetail(token, challengeId);
                setChallenge(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [challengeId, isLoggedIn, token]);

    return { challenge, loading, error };
}
