package com.tradingco.trading.service;

import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.common.exception.*;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import com.tradingco.trading.model.*;
import com.tradingco.trading.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Order Execution Engine — processes market, limit, and stop orders.
 * Simulates realistic fills with slippage and commission.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderExecutionService {

    private final OrderRepository orderRepository;
    private final PositionRepository positionRepository;
    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;
    private final QuoteRepository quoteRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.tradingco.risk.service.RiskManagementService riskManagementService;

    private static final BigDecimal COMMISSION_PER_SHARE = new BigDecimal("0.005"); // $0.005/share
    private static final BigDecimal MIN_COMMISSION = new BigDecimal("1.00");
    private static final BigDecimal SLIPPAGE_BPS = new BigDecimal("0.0002"); // 2 bps

    /**
     * Place a new order. Market orders execute immediately.
     * Limit/Stop orders are queued for later execution.
     */
    @Transactional
    public Order placeOrder(UUID accountId, String symbol, Side side, OrderType orderType,
                            int quantity, BigDecimal limitPrice, BigDecimal stopPrice,
                            TimeInForce tif, BigDecimal stopLoss, BigDecimal takeProfit) {

        // Validate account
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId.toString()));

        // Validate symbol
        Quote quote = quoteRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "symbol", symbol));

        // Build order
        Order order = Order.builder()
                .accountId(accountId)
                .symbol(symbol.toUpperCase())
                .side(side)
                .orderType(orderType)
                .status(OrderStatus.PENDING)
                .quantity(quantity)
                .filledQuantity(0)
                .limitPrice(limitPrice)
                .stopPrice(stopPrice)
                .timeInForce(tif != null ? tif : TimeInForce.DAY)
                .stopLoss(stopLoss)
                .takeProfit(takeProfit)
                .build();

        // Pre-trade risk check
        com.tradingco.risk.dto.RiskCheckResult riskResult = riskManagementService.checkOrder(order, account);
        if (riskResult.hasBlocks()) {
            throw new OrderValidationException(String.join(". ", riskResult.blocks()));
        }
        order.setWarnings(riskResult.warnings());

        // Validate order
        validateOrder(order, account, quote);

        order = orderRepository.save(order);

        // Market orders fill immediately
        if (orderType == OrderType.MARKET) {
            BigDecimal fillPrice = calculateFillPrice(quote, side);
            executeOrder(order, fillPrice, account);
        } else {
            order.setStatus(OrderStatus.ACCEPTED);
            orderRepository.save(order);
        }

        // Broadcast order update via WebSocket
        messagingTemplate.convertAndSend("/topic/orders/" + accountId, order);

        log.info("Order placed: {} {} {} {} @ {}", order.getId(), side, quantity, symbol,
                orderType == OrderType.MARKET ? "MARKET" : limitPrice);

        return order;
    }

    /**
     * Cancel a pending/accepted order.
     */
    @Transactional
    public Order cancelOrder(UUID orderId, UUID accountId) {
        Order order = orderRepository.findByIdAndAccountId(orderId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        if (!order.isActive()) {
            throw new OrderValidationException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        messagingTemplate.convertAndSend("/topic/orders/" + accountId, order);
        return order;
    }

    /**
     * Check and execute pending limit/stop orders against current market prices.
     * Called periodically by the market data service.
     */
    @Transactional
    public void checkPendingOrders() {
        List<Order> activeOrders = orderRepository.findByStatusIn(
                List.of(OrderStatus.PENDING, OrderStatus.ACCEPTED));

        for (Order order : activeOrders) {
            try {
                Quote quote = quoteRepository.findBySymbol(order.getSymbol()).orElse(null);
                if (quote == null) continue;

                Account account = accountRepository.findById(order.getAccountId()).orElse(null);
                if (account == null) continue;

                BigDecimal marketPrice = quote.getLastPrice();

                switch (order.getOrderType()) {
                    case LIMIT -> {
                        if (shouldFillLimit(order, marketPrice)) {
                            executeOrder(order, order.getLimitPrice(), account);
                        }
                    }
                    case STOP -> {
                        if (shouldTriggerStop(order, marketPrice)) {
                            BigDecimal fillPrice = calculateFillPrice(quote, order.getSide());
                            executeOrder(order, fillPrice, account);
                        }
                    }
                    case STOP_LIMIT -> {
                        if (shouldTriggerStop(order, marketPrice) && order.getLimitPrice() != null) {
                            if (shouldFillLimit(order, marketPrice)) {
                                executeOrder(order, order.getLimitPrice(), account);
                            }
                        }
                    }
                    default -> {}
                }
            } catch (Exception e) {
                log.error("Error processing order {}: {}", order.getId(), e.getMessage());
            }
        }
    }

    // ── Private methods ─────────────────────────────────────────────

    private void validateOrder(Order order, Account account, Quote quote) {
        if (order.getQuantity() <= 0) throw new OrderValidationException("Quantity must be > 0");
        if (order.getQuantity() > 100000) throw new OrderValidationException("Max 100,000 shares per order");

        if (order.getSide() == Side.BUY) {
            BigDecimal estimatedCost = quote.getAsk().multiply(BigDecimal.valueOf(order.getQuantity()));
            if (estimatedCost.compareTo(account.getCashBalance()) > 0) {
                throw new InsufficientFundsException(
                        "Insufficient funds. Need " + estimatedCost + " but have " + account.getCashBalance());
            }
        } else {
            // For SELL, check if user has the position
            Optional<Position> pos = positionRepository.findByAccountIdAndSymbol(
                    account.getId(), order.getSymbol());
            if (pos.isEmpty() || pos.get().getQuantity() < order.getQuantity()) {
                throw new OrderValidationException("Insufficient shares to sell");
            }
        }

        if (order.getOrderType() == OrderType.LIMIT && order.getLimitPrice() == null) {
            throw new OrderValidationException("Limit price required for LIMIT orders");
        }
        if (order.getOrderType() == OrderType.STOP && order.getStopPrice() == null) {
            throw new OrderValidationException("Stop price required for STOP orders");
        }
    }

    private BigDecimal calculateFillPrice(Quote quote, Side side) {
        // BUY fills at ask + slippage, SELL fills at bid - slippage
        BigDecimal basePrice = side == Side.BUY ? quote.getAsk() : quote.getBid();
        BigDecimal slippage = basePrice.multiply(SLIPPAGE_BPS);
        return side == Side.BUY
                ? basePrice.add(slippage).setScale(2, RoundingMode.HALF_UP)
                : basePrice.subtract(slippage).setScale(2, RoundingMode.HALF_UP);
    }

    private void executeOrder(Order order, BigDecimal fillPrice, Account account) {
        int qty = order.getQuantity();
        BigDecimal totalCost = fillPrice.multiply(BigDecimal.valueOf(qty));
        BigDecimal commission = COMMISSION_PER_SHARE.multiply(BigDecimal.valueOf(qty))
                .max(MIN_COMMISSION);

        // Update order
        order.setAvgFillPrice(fillPrice);
        order.setFilledQuantity(qty);
        order.setStatus(OrderStatus.FILLED);
        order.setFilledAt(LocalDateTime.now());
        orderRepository.save(order);

        // Update account balance
        if (order.getSide() == Side.BUY) {
            account.setCashBalance(account.getCashBalance()
                    .subtract(totalCost).subtract(commission));
        } else {
            account.setCashBalance(account.getCashBalance()
                    .add(totalCost).subtract(commission));
        }
        accountRepository.save(account);

        // Update position
        updatePosition(order, fillPrice);

        log.info("Order {} filled: {} {} {} @ {} (commission: {})",
                order.getId(), order.getSide(), qty, order.getSymbol(), fillPrice, commission);
    }

    private void updatePosition(Order order, BigDecimal fillPrice) {
        Optional<Position> existingPos = positionRepository.findByAccountIdAndSymbol(
                order.getAccountId(), order.getSymbol());

        if (order.getSide() == Side.BUY) {
            if (existingPos.isPresent()) {
                Position pos = existingPos.get();
                if (pos.getSide() == Side.BUY) {
                    // Add to existing long position
                    int newQty = pos.getQuantity() + order.getQuantity();
                    BigDecimal newCost = pos.getAvgCost().multiply(BigDecimal.valueOf(pos.getQuantity()))
                            .add(fillPrice.multiply(BigDecimal.valueOf(order.getQuantity())))
                            .divide(BigDecimal.valueOf(newQty), 6, RoundingMode.HALF_UP);
                    pos.setQuantity(newQty);
                    pos.setAvgCost(newCost);
                    pos.updateMarketData(fillPrice);
                    positionRepository.save(pos);
                } else {
                    // Closing/reducing short position — create trade record
                    closeOrReducePosition(pos, order, fillPrice);
                }
            } else {
                // Open new long position
                Position pos = Position.builder()
                        .accountId(order.getAccountId())
                        .symbol(order.getSymbol())
                        .side(Side.BUY)
                        .quantity(order.getQuantity())
                        .avgCost(fillPrice)
                        .build();
                pos.updateMarketData(fillPrice);
                positionRepository.save(pos);
            }
        } else { // SELL
            if (existingPos.isPresent()) {
                Position pos = existingPos.get();
                closeOrReducePosition(pos, order, fillPrice);
            }
        }
    }

    private void closeOrReducePosition(Position pos, Order order, BigDecimal fillPrice) {
        int closeQty = Math.min(pos.getQuantity(), order.getQuantity());

        // Create trade record for closed portion
        BigDecimal pnl;
        if (pos.getSide() == Side.BUY) {
            pnl = fillPrice.subtract(pos.getAvgCost()).multiply(BigDecimal.valueOf(closeQty));
        } else {
            pnl = pos.getAvgCost().subtract(fillPrice).multiply(BigDecimal.valueOf(closeQty));
        }
        BigDecimal costBasis = pos.getAvgCost().multiply(BigDecimal.valueOf(closeQty));
        BigDecimal pnlPct = costBasis.compareTo(BigDecimal.ZERO) != 0
                ? pnl.divide(costBasis, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        Trade trade = Trade.builder()
                .accountId(order.getAccountId())
                .symbol(order.getSymbol())
                .side(pos.getSide().name())
                .quantity(closeQty)
                .entryPrice(pos.getAvgCost())
                .exitPrice(fillPrice)
                .entryTime(pos.getOpenedAt())
                .exitTime(LocalDateTime.now())
                .pnl(pnl)
                .pnlPercent(pnlPct)
                .entryOrderId(null)
                .exitOrderId(order.getId())
                .build();
        tradeRepository.save(trade);

        // Update or remove position
        int remaining = pos.getQuantity() - closeQty;
        if (remaining <= 0) {
            positionRepository.delete(pos);
        } else {
            pos.setQuantity(remaining);
            pos.updateMarketData(fillPrice);
            positionRepository.save(pos);
        }
    }

    private boolean shouldFillLimit(Order order, BigDecimal marketPrice) {
        if (order.getSide() == Side.BUY) {
            return marketPrice.compareTo(order.getLimitPrice()) <= 0;
        } else {
            return marketPrice.compareTo(order.getLimitPrice()) >= 0;
        }
    }

    private boolean shouldTriggerStop(Order order, BigDecimal marketPrice) {
        if (order.getSide() == Side.BUY) {
            return marketPrice.compareTo(order.getStopPrice()) >= 0;
        } else {
            return marketPrice.compareTo(order.getStopPrice()) <= 0;
        }
    }
}
