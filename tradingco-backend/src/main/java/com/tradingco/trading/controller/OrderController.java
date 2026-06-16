package com.tradingco.trading.controller;

import com.tradingco.trading.dto.OrderResponse;
import com.tradingco.trading.dto.PlaceOrderRequest;
import com.tradingco.trading.model.Order;
import com.tradingco.trading.model.OrderStatus;
import com.tradingco.trading.repository.OrderRepository;
import com.tradingco.trading.service.OrderExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order placement and management")
public class OrderController {

    private final OrderExecutionService orderExecutionService;
    private final OrderRepository orderRepository;

    @PostMapping
    @Operation(summary = "Place a new order")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest req) {
        Order order = orderExecutionService.placeOrder(
                req.accountId(), req.symbol(), req.side(), req.orderType(),
                req.quantity(), req.limitPrice(), req.stopPrice(),
                req.timeInForce(), req.stopLoss(), req.takeProfit()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(order));
    }

    @GetMapping
    @Operation(summary = "Get orders for an account")
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam UUID accountId,
            @RequestParam(required = false) String status) {

        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByAccountIdAndStatusOrderByCreatedAtDesc(
                    accountId, OrderStatus.valueOf(status.toUpperCase()));
        } else {
            orders = orderRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
        }
        return ResponseEntity.ok(orders.stream().map(OrderResponse::from).toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new com.tradingco.common.exception.ResourceNotFoundException("Order", "id", id.toString()));
        return ResponseEntity.ok(OrderResponse.from(order));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending order")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @RequestParam UUID accountId) {
        Order order = orderExecutionService.cancelOrder(id, accountId);
        return ResponseEntity.ok(OrderResponse.from(order));
    }
}
