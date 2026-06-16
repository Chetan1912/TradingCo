import { useState, useEffect } from 'react';
import { newsApi } from '../../api/newsApi';
import styles from './NewsPage.module.css';

function NewsCardSkeleton() {
  return (
    <div className="card" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
        <div className="skeleton" style={{ width: '60px', height: '18px' }} />
        <div className="skeleton" style={{ width: '80px', height: '18px' }} />
        <div className="skeleton" style={{ marginLeft: 'auto', width: '120px', height: '14px' }} />
      </div>
      <div className="skeleton" style={{ width: '85%', height: '20px', marginBottom: 'var(--space-sm)' }} />
      <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '4px' }} />
      <div className="skeleton" style={{ width: '90%', height: '14px' }} />
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <div style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div className="skeleton" style={{ width: '40px', height: '12px' }} />
        <div className="skeleton" style={{ width: '60px', height: '12px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '14px' }} />
    </div>
  );
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRes, trendRes] = await Promise.all([
        newsApi.getNews(),
        newsApi.getTrendingNews(),
      ]);
      setNewsList(allRes.data);
      setTrending(trendRes.data);
    } catch (err) {
      setError('Failed to fetch market news.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every 30 seconds
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={styles.newsContainer}>
      
      {/* News Feed */}
      <div className={styles.newsFeed}>
        <div className={styles.titleRow}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>📰 Market News Feed</h1>
          <button onClick={fetchNews} className="btn-outline" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }} disabled={isLoading}>
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {error && (
          <div className={styles.errorMsg}>
            {error}
          </div>
        )}

        {isLoading && newsList.length === 0 ? (
          <>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </>
        ) : newsList.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No news items generated yet.
          </div>
        ) : (
          newsList.map((news) => (
            <div 
              key={news.id} 
              className={`card ${styles.newsCard}`} 
            >
              <div className={styles.badgeRow}>
                {news.symbol && (
                  <span className={styles.symbolBadge}>
                    {news.symbol}
                  </span>
                )}
                
                {news.sentiment && (
                  <span className={`${styles.sentimentBadge} ${
                    news.sentiment === 'POSITIVE' ? styles.sentimentPositive
                      : news.sentiment === 'NEGATIVE' ? styles.sentimentNegative
                      : styles.sentimentNeutral
                  }`}>
                    {news.sentiment === 'POSITIVE' ? '▲ Bullish' : news.sentiment === 'NEGATIVE' ? '▼ Bearish' : '● Neutral'}
                  </span>
                )}
                
                <span className={styles.metaText}>
                  {news.source || 'Brokerage'} · {formatRelativeTime(news.publishedAt)}
                </span>
              </div>
              <h3 className={styles.headline}>
                {news.headline}
              </h3>
              <p className={styles.summary}>
                {news.summary}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Trending Bar */}
      <div className={styles.trendingBar}>
        <div className={`card ${styles.trendingCard}`}>
          <h3 className={styles.trendingTitle}>
            🔥 Trending Catalysts
          </h3>
          
          {isLoading && trending.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <TrendingSkeleton />
              <TrendingSkeleton />
              <TrendingSkeleton />
            </div>
          ) : trending.length === 0 ? (
            <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              No active trending events.
            </div>
          ) : (
            <div className={styles.trendingList}>
              {trending.map((t) => (
                <div 
                  key={t.id}
                  className={styles.trendingItem}
                  style={{
                    borderLeft: t.sentiment === 'POSITIVE' ? '3px solid var(--profit-green)' : t.sentiment === 'NEGATIVE' ? '3px solid var(--loss-red)' : '3px solid var(--border)',
                  }}
                >
                  <div className={styles.trendingMeta}>
                    <span className={styles.trendingSymbol}>{t.symbol}</span>
                    <span>{formatRelativeTime(t.publishedAt)}</span>
                  </div>
                  <div className={styles.trendingHeadline}>
                    {t.headline}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
