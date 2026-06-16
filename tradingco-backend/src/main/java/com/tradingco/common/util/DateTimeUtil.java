package com.tradingco.common.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Set;

/**
 * Utility class for market-hours logic based on US Eastern Time.
 * Handles regular trading hours (9:30 AM – 4:00 PM ET),
 * pre-market (4:00 AM – 9:30 AM ET), and after-hours (4:00 PM – 8:00 PM ET).
 */
public final class DateTimeUtil {

    private static final ZoneId NEW_YORK_ZONE = ZoneId.of("America/New_York");

    private static final LocalTime MARKET_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);
    private static final LocalTime PRE_MARKET_OPEN = LocalTime.of(4, 0);
    private static final LocalTime AFTER_HOURS_CLOSE = LocalTime.of(20, 0);

    /** Major US market holidays for 2024–2026. Extend as needed. */
    private static final Set<LocalDate> HOLIDAYS = Set.of(
            // 2024
            LocalDate.of(2024, 1, 1),   // New Year's Day
            LocalDate.of(2024, 1, 15),  // MLK Day
            LocalDate.of(2024, 2, 19),  // Presidents Day
            LocalDate.of(2024, 3, 29),  // Good Friday
            LocalDate.of(2024, 5, 27),  // Memorial Day
            LocalDate.of(2024, 6, 19),  // Juneteenth
            LocalDate.of(2024, 7, 4),   // Independence Day
            LocalDate.of(2024, 9, 2),   // Labor Day
            LocalDate.of(2024, 11, 28), // Thanksgiving
            LocalDate.of(2024, 12, 25), // Christmas
            // 2025
            LocalDate.of(2025, 1, 1),
            LocalDate.of(2025, 1, 20),
            LocalDate.of(2025, 2, 17),
            LocalDate.of(2025, 4, 18),
            LocalDate.of(2025, 5, 26),
            LocalDate.of(2025, 6, 19),
            LocalDate.of(2025, 7, 4),
            LocalDate.of(2025, 9, 1),
            LocalDate.of(2025, 11, 27),
            LocalDate.of(2025, 12, 25),
            // 2026
            LocalDate.of(2026, 1, 1),
            LocalDate.of(2026, 1, 19),
            LocalDate.of(2026, 2, 16),
            LocalDate.of(2026, 4, 3),
            LocalDate.of(2026, 5, 25),
            LocalDate.of(2026, 6, 19),
            LocalDate.of(2026, 7, 3),
            LocalDate.of(2026, 9, 7),
            LocalDate.of(2026, 11, 26),
            LocalDate.of(2026, 12, 25)
    );

    private DateTimeUtil() {
        // Utility class — no instantiation
    }

    /**
     * Returns the current time in the America/New_York timezone.
     */
    public static ZonedDateTime getNewYorkTime() {
        return ZonedDateTime.now(NEW_YORK_ZONE);
    }

    /**
     * Checks whether the US stock market is currently in regular trading hours.
     */
    public static boolean isMarketOpen() {
        ZonedDateTime now = getNewYorkTime();
        if (isWeekend(now) || isHoliday(now.toLocalDate())) {
            return false;
        }
        LocalTime time = now.toLocalTime();
        return !time.isBefore(MARKET_OPEN) && time.isBefore(MARKET_CLOSE);
    }

    /**
     * Returns the current market session as a human-readable string.
     *
     * @return one of "PRE_MARKET", "REGULAR", "AFTER_HOURS", or "CLOSED"
     */
    public static String getMarketSession() {
        ZonedDateTime now = getNewYorkTime();
        if (isWeekend(now) || isHoliday(now.toLocalDate())) {
            return "CLOSED";
        }

        LocalTime time = now.toLocalTime();
        if (!time.isBefore(MARKET_OPEN) && time.isBefore(MARKET_CLOSE)) {
            return "REGULAR";
        } else if (!time.isBefore(PRE_MARKET_OPEN) && time.isBefore(MARKET_OPEN)) {
            return "PRE_MARKET";
        } else if (!time.isBefore(MARKET_CLOSE) && time.isBefore(AFTER_HOURS_CLOSE)) {
            return "AFTER_HOURS";
        }
        return "CLOSED";
    }

    /**
     * Checks whether the given date/time falls on a weekend.
     */
    public static boolean isWeekend(ZonedDateTime dateTime) {
        DayOfWeek day = dateTime.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    /**
     * Checks whether the given date is a known US market holiday.
     */
    public static boolean isHoliday(LocalDate date) {
        return HOLIDAYS.contains(date);
    }
}
