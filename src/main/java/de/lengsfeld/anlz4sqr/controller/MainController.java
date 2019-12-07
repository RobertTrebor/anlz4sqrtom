package de.lengsfeld.anlz4sqr.controller;

import de.lengsfeld.anlz4sqr.connect.FSConnectWeb;
import de.lengsfeld.anlz4sqr.connect.FSManager;
import de.lengsfeld.anlz4sqr.form.MainForm;
import de.lengsfeld.anlz4sqr.form.MapForm;
import fi.foyt.foursquare.api.FoursquareApiException;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.Checkin;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.VenueHistoryGroup;
import fi.foyt.foursquare.api.entities.VenuesSearchResult;
import org.primefaces.PrimeFaces;
import org.primefaces.model.map.LatLng;
import org.primefaces.model.map.Marker;

import javax.annotation.PostConstruct;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Named
@RequestScoped
public class MainController implements Serializable {

	@Inject
    private FSConnectWeb fsConnect;

	@Inject
	private MainForm form;

	@Inject
	private MapController mapController;

	@Inject
	private MapForm mapForm;

	@Inject
	private CategoriesController categoriesController;

    private FSManager fsManager;

	@PostConstruct
    public void init(){
        System.setProperty("java.net.useSystemProxies", "true");
	    fsManager = new FSManager(fsConnect.getFoursquareApi());
    }


	public void onStart(){

    }

	public void load(){
		form.setView(0);
		update();
	}

	public void loadResult() {
		if(form.getView() == 0) {
			form.setCategory(categoriesController.getCategoryId());
			if (form.getCategory().equals("0000")) {
				form.setCategory("");
			}
			Result<VenuesSearchResult> result = fsManager.draw3(mapForm.getCoordinates(), form.getQuery(), form.getCategory());
			form.setVenues(Arrays.asList(result.getResult().getVenues()));
			for(CompactVenue venue : form.getVenues()) {
				LatLng latLng = new LatLng(venue.getLocation().getLat(), venue.getLocation().getLng());
				Marker marker = new Marker(latLng);
				mapController.addMarker(marker);
			}
		}
	}

	public void loadHistory(){
		form.setView(1);
		Result<VenueHistoryGroup> result = fsManager.venueHistory();
		if(result != null) {
			VenueHistoryGroup venueHistoryGroup = result.getResult();
			form.setVenueHistories(Arrays.asList(venueHistoryGroup.getItems()));
		}
	}

	public void switchView(Integer view){
		form.setView(view);
	}

	public void update(){
		int view = form.getView();
		switch(view){
			case 0:
				loadResult();
				break;
			case 1:
				loadHistory();
				break;
			case 2:
				//loadFromDb();
				break;
			case 3:
				loadCheckins();
				break;
		}
	}

	public void loadCheckins(){
		form.setView(3);
		loadMoreCheckins();
	}

	private void loadMoreCheckins(){
        form.setCheckins(loadCheckinsOffset());
        form.setNumCheckinsLoaded((form.getNumCheckinsLoaded() + form.getNumCheckins()));
    }

	private List<Checkin> loadCheckinsOffset(){
		List<Checkin> checkins = form.getCheckins();
		List<Checkin> moreCheckins = fsManager.checkinHistory(form.getNumCheckins(), form.getNumCheckinsLoaded());
        if(form.getCheckinsWithComments()) {
            moreCheckins = loadCheckinsWithComments(moreCheckins);
        }
		List<Checkin> expandedList = new ArrayList<>();
        expandedList.addAll(checkins);
        expandedList.addAll(moreCheckins);
        return expandedList;
	}

	public List<Checkin> loadCheckinsWithComments(List<Checkin> checkins){
		List<Checkin> checkinsWithComments = new ArrayList<>();
		for(Checkin checkin : checkins){
			Long l = checkin.getCreatedAt();
			String name = checkin.getVenue().getName();
			if(checkin.getComments() != null && checkin.getComments().getCount() != null && checkin.getComments().getCount() > 0) {
				checkinsWithComments.add(checkin);
			}
		}

		if(!checkinsWithComments.isEmpty()) {
			String comments = "";
			for (Checkin checkin : checkinsWithComments) {
				try {
					comments += fsManager.retrieveComments(checkin.getId());
				} catch (FoursquareApiException e) {
					e.printStackTrace();
				}
			}
			form.setConcatenatedComments(comments);
		}
		return checkinsWithComments;
    }

	public String retrieveComment(){
		String comments = "";
		try {
			comments = fsManager.retrieveComments(form.getSelectedCheckin().getId());
			form.setSelectedComment(comments);
		} catch (FoursquareApiException e) {
			e.printStackTrace();
		}
		return comments;
	}

	public boolean isAuthenticated(){
	    return fsConnect.isAuthenticated();
    }

    public void close(){
		PrimeFaces.current().executeScript("PF('venueDialog').hide();");
	}

}
