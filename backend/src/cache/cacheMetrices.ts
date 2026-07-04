export const cacheMetrices = {
    cacheHits: 0,
    cacheMisses: 0,

    incrementHits() {
        this.cacheHits++;
    },
    incrementMisses() {
        this.cacheMisses++;
    },

    getMetrics() {
        const total = this.cacheHits + this.cacheMisses;
        const hitRate = total == 0 ? 0 : (this.cacheHits / total) * 100;
        return {
            cacheHits: this.cacheHits,
            cacheMisses: this.cacheMisses,
            hitRate: hitRate.toFixed(2) + '%',
        };
    }
}