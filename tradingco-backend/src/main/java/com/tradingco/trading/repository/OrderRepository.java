package com.tradingco.trading.repository;

import com.tradingco.trading.model.Order;
import com.tradingco.trading.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByAccountIdOrderByCreatedAtDesc(UUID accountId);

    List<Order> findByAccountIdAndStatusOrderByCreatedAtDesc(UUID accountId, OrderStatus status);

    List<Order> findByStatusIn(List<OrderStatus> statuses);

    Optional<Order> findByIdAndAccountId(UUID id, UUID accountId);

    List<Order> findByAccountIdAndSymbolAndStatusIn(UUID accountId, String symbol, List<OrderStatus> statuses);
}
