-- ============================================================
-- TradingCo Database Schema V1
-- All tables for the mock trading platform
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    experience_level VARCHAR(20) DEFAULT 'BEGINNER',
    role            VARCHAR(20) DEFAULT 'USER',
    avatar_url      VARCHAR(500),
    timezone        VARCHAR(50) DEFAULT 'America/New_York',
    ui_theme        VARCHAR(20) DEFAULT 'DARK',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_login_at   TIMESTAMP,
    is_active       BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- ACCOUNTS (Virtual Trading Accounts)
-- ============================================================
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    initial_balance DECIMAL(15,2) NOT NULL,
    cash_balance    DECIMAL(15,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_accounts_user ON accounts(user_id);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    asset_type      VARCHAR(20) NOT NULL,
    exchange        VARCHAR(50),
    sector          VARCHAR(100),
    industry        VARCHAR(100),
    market_cap      BIGINT,
    pe_ratio        DECIMAL(10,2),
    eps             DECIMAL(10,2),
    dividend_yield  DECIMAL(5,2),
    beta            DECIMAL(5,2),
    high_52w        DECIMAL(15,4),
    low_52w         DECIMAL(15,4),
    avg_volume      BIGINT,
    lot_size        INTEGER DEFAULT 1,
    tick_size       DECIMAL(10,6) DEFAULT 0.01,
    is_tradeable    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_sector ON assets(sector);

-- ============================================================
-- QUOTES (Latest Price Snapshot)
-- ============================================================
CREATE TABLE quotes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20) NOT NULL,
    bid             DECIMAL(15,6) NOT NULL,
    ask             DECIMAL(15,6) NOT NULL,
    last_price      DECIMAL(15,6) NOT NULL,
    prev_close      DECIMAL(15,6),
    open_price      DECIMAL(15,6),
    day_high        DECIMAL(15,6),
    day_low         DECIMAL(15,6),
    volume          BIGINT DEFAULT 0,
    vwap            DECIMAL(15,6),
    change_amount   DECIMAL(15,6),
    change_percent  DECIMAL(8,4),
    market_status   VARCHAR(20) DEFAULT 'CLOSED',
    updated_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_quotes_symbol UNIQUE(symbol)
);
CREATE INDEX idx_quotes_symbol ON quotes(symbol);

-- ============================================================
-- CANDLES (OHLCV)
-- ============================================================
CREATE TABLE candles (
    id              BIGSERIAL PRIMARY KEY,
    symbol          VARCHAR(20) NOT NULL,
    timeframe       VARCHAR(5) NOT NULL,
    open_time       TIMESTAMP NOT NULL,
    open            DECIMAL(15,6) NOT NULL,
    high            DECIMAL(15,6) NOT NULL,
    low             DECIMAL(15,6) NOT NULL,
    close           DECIMAL(15,6) NOT NULL,
    volume          BIGINT DEFAULT 0,
    CONSTRAINT uq_candles UNIQUE(symbol, timeframe, open_time)
);
CREATE INDEX idx_candles_lookup ON candles(symbol, timeframe, open_time DESC);

-- ============================================================
-- WATCHLISTS
-- ============================================================
CREATE TABLE watchlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);

CREATE TABLE watchlist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id    UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    added_at        TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_watchlist_symbol UNIQUE(watchlist_id, symbol)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    side            VARCHAR(4) NOT NULL,
    order_type      VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    quantity        INTEGER NOT NULL,
    filled_quantity INTEGER DEFAULT 0,
    limit_price     DECIMAL(15,6),
    stop_price      DECIMAL(15,6),
    avg_fill_price  DECIMAL(15,6),
    time_in_force   VARCHAR(5) DEFAULT 'DAY',
    stop_loss       DECIMAL(15,6),
    take_profit     DECIMAL(15,6),
    parent_order_id UUID REFERENCES orders(id),
    reject_reason   VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    filled_at       TIMESTAMP,
    expires_at      TIMESTAMP
);
CREATE INDEX idx_orders_account ON orders(account_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_symbol ON orders(symbol);

-- ============================================================
-- ORDER FILLS
-- ============================================================
CREATE TABLE order_fills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    fill_price      DECIMAL(15,6) NOT NULL,
    fill_quantity   INTEGER NOT NULL,
    slippage        DECIMAL(15,6) DEFAULT 0,
    commission      DECIMAL(10,4) DEFAULT 0,
    filled_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_order_fills_order ON order_fills(order_id);

-- ============================================================
-- TRADES (Closed Round-Trips)
-- ============================================================
CREATE TABLE trades (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    side            VARCHAR(5) NOT NULL,
    quantity        INTEGER NOT NULL,
    entry_price     DECIMAL(15,6) NOT NULL,
    exit_price      DECIMAL(15,6) NOT NULL,
    entry_time      TIMESTAMP NOT NULL,
    exit_time       TIMESTAMP NOT NULL,
    pnl             DECIMAL(15,4) NOT NULL,
    pnl_percent     DECIMAL(8,4) NOT NULL,
    commission_total DECIMAL(10,4) DEFAULT 0,
    holding_duration INTERVAL,
    entry_order_id  UUID REFERENCES orders(id),
    exit_order_id   UUID REFERENCES orders(id),
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_trades_account ON trades(account_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_exit_time ON trades(account_id, exit_time DESC);

-- ============================================================
-- POSITIONS (Open)
-- ============================================================
CREATE TABLE positions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    side            VARCHAR(5) NOT NULL,
    quantity        INTEGER NOT NULL,
    avg_cost        DECIMAL(15,6) NOT NULL,
    current_price   DECIMAL(15,6),
    market_value    DECIMAL(15,4),
    unrealized_pnl  DECIMAL(15,4),
    unrealized_pnl_pct DECIMAL(8,4),
    opened_at       TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_position UNIQUE(account_id, symbol)
);
CREATE INDEX idx_positions_account ON positions(account_id);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    alert_type      VARCHAR(20) NOT NULL,
    target_value    DECIMAL(15,6) NOT NULL,
    is_triggered    BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    triggered_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(is_active, is_triggered);

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE news_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline        VARCHAR(500) NOT NULL,
    summary         TEXT,
    body            TEXT,
    source          VARCHAR(100),
    sentiment       VARCHAR(10),
    impact_level    VARCHAR(10) DEFAULT 'LOW',
    published_at    TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_news_published ON news_items(published_at DESC);

CREATE TABLE news_symbols (
    news_id         UUID REFERENCES news_items(id) ON DELETE CASCADE,
    symbol          VARCHAR(20) NOT NULL,
    PRIMARY KEY (news_id, symbol)
);
CREATE INDEX idx_news_symbols_symbol ON news_symbols(symbol);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE journal_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    trade_id        UUID REFERENCES trades(id),
    symbol          VARCHAR(20),
    strategy_tag    VARCHAR(50),
    notes           TEXT,
    emotion         VARCHAR(20),
    trade_rating    INTEGER CHECK (trade_rating BETWEEN 1 AND 5),
    lessons_learned TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_journal_account ON journal_entries(account_id);

-- ============================================================
-- PERFORMANCE SNAPSHOTS (Daily)
-- ============================================================
CREATE TABLE performance_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    snapshot_date   DATE NOT NULL,
    total_equity    DECIMAL(15,4) NOT NULL,
    cash_balance    DECIMAL(15,4) NOT NULL,
    positions_value DECIMAL(15,4) NOT NULL,
    daily_pnl       DECIMAL(15,4),
    cumulative_pnl  DECIMAL(15,4),
    trade_count     INTEGER DEFAULT 0,
    win_count       INTEGER DEFAULT 0,
    loss_count      INTEGER DEFAULT 0,
    CONSTRAINT uq_perf_snapshot UNIQUE(account_id, snapshot_date)
);
CREATE INDEX idx_perf_snapshots ON performance_snapshots(account_id, snapshot_date DESC);

-- ============================================================
-- ECONOMIC EVENTS
-- ============================================================
CREATE TABLE economic_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name      VARCHAR(200) NOT NULL,
    country         VARCHAR(5) NOT NULL,
    event_time      TIMESTAMP NOT NULL,
    impact_level    VARCHAR(10),
    previous_value  VARCHAR(50),
    forecast_value  VARCHAR(50),
    actual_value    VARCHAR(50),
    category        VARCHAR(50)
);
CREATE INDEX idx_economic_events_time ON economic_events(event_time);

-- ============================================================
-- CORPORATE EVENTS
-- ============================================================
CREATE TABLE corporate_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol          VARCHAR(20) NOT NULL,
    event_type      VARCHAR(20) NOT NULL,
    event_date      DATE NOT NULL,
    details         JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_corporate_events_symbol ON corporate_events(symbol);
CREATE INDEX idx_corporate_events_date ON corporate_events(event_date);
