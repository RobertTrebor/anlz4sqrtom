package de.lengsfeld.anlz4sqr.form;

import de.lengsfeld.anlz4sqr.TabName;
import fi.foyt.foursquare.api.entities.Checkin;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.VenueHistory;
import lombok.Getter;
import lombok.Setter;

import javax.enterprise.context.SessionScoped;
import javax.inject.Named;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Named
@SessionScoped
public class MainForm implements Serializable {

	private static final long serialVersionUID = 1L;

	private TabName tabName = TabName.VENUES;
	private List<CompactVenue> venues;
	private Integer numRows = 15;
	private List<VenueHistory> venueHistories;
	//private List<de.lengsfeld.anlz4sqr.entity.VenueHistory> venueHistoriesDb;
	private List<Checkin> checkins = new ArrayList<>();
	private Integer numCheckins = 10;
	private Integer numCheckinsLoaded = 0;
	private CompactVenue selectedVenue;
	private VenueHistory selectedHistory;
	private Checkin selectedCheckin;
	private Boolean checkinsWithComments = false;
	private String selectedComment;
	private String concatenatedComments;

	private String query;
	private String category;

	public void reset() {
		tabName = TabName.VENUES;
		checkins = new ArrayList<>();
		numCheckins = 10;
		numCheckinsLoaded = 0;
	}

	public Boolean getCheckinsWithComments() {
		return checkinsWithComments;
	}

	public void setCheckinsWithComments(Boolean checkinsWithComments) {
		this.checkinsWithComments = checkinsWithComments;
	}
}