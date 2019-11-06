package de.lengsfeld.anlz4sqr.connect;

import fi.foyt.foursquare.api.FoursquareApi;

public interface FSConnector {
    String authorize();
    String authorizeToken(String header);
    FoursquareApi getFoursquareApi();
}
