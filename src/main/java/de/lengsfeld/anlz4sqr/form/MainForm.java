package de.lengsfeld.anlz4sqr.form;

import fi.foyt.foursquare.api.entities.Checkin;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.VenueHistory;
import lombok.Getter;
import lombok.Setter;

import javax.enterprise.context.SessionScoped;
import javax.inject.Named;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Named
@SessionScoped
public class MainForm implements Serializable {

	private static final long serialVersionUID = 1L;

	private List<CompactVenue> venues;
	private List<VenueHistory> venueHistories;
	//private List<de.lengsfeld.anlz4sqr.entity.VenueHistory> venueHistoriesDb;
	private List<Checkin> checkins;
	private Integer numCheckins = 10;
	private Integer numCheckinsLoaded = 0;
	private CompactVenue selectedVenue;
	private VenueHistory selectedHistory;
	private Checkin selectedCheckin;
	private Boolean checkinsWithComments = false;
	private String selectedComment;
	private String concatenatedComments;
	private Integer view = 0;

	private String coordinates;
	private String query;
	private String category;

    public Boolean getCheckinsWithComments() {
        return checkinsWithComments;
    }

    public void setCheckinsWithComments(Boolean checkinsWithComments) {
        this.checkinsWithComments = checkinsWithComments;
    }
}