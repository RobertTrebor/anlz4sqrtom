package de.lengsfeld.anlz4sqr;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Getter
public enum TabName {

    VENUES("Venues"),
    HISTORY("History"),
    CHECKINS("Checkins");

    private final String name;

    public static TabName fromString(String name) {
        if (null != name) {
            final Optional<TabName> first = Stream.of(TabName.values()).filter(
                    val -> val.getName().equals(name)).findFirst();
            if (first.isPresent()) {
                return first.get();
            }
        }
        return null;
    }
}
