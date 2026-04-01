import { useState, useEffect, useCallback } from 'react';

export function useQuota(quotaUrl) {
    const [quota, setQuota] = useState(null);

    const refresh = useCallback(() => {
        if (!quotaUrl) return;
        fetch(quotaUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setQuota(data); })
            .catch(() => {});
    }, [quotaUrl]);

    useEffect(() => { refresh(); }, [refresh]);

    return { quota, refreshQuota: refresh };
}
