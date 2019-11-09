package de.lengsfeld.anlz4sqr.connect;

import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.FoursquareApiException;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

public final class FSManager {

	private FoursquareApi foursquareApi;

	public FSManager() {
		FSConnector fs = FSConnect.getInstance();
		this.foursquareApi = fs.getFoursquareApi();
	}

	public FSManager(FoursquareApi foursquareApi) {
		this.foursquareApi = foursquareApi;
	}

	public Result<VenuesSearchResult> collectVenues(String ll, String query,
                                                    String categoryId) throws FoursquareApiException {

		System.setProperty("java.net.useSystemProxies", "true");

		Result<VenuesSearchResult> result = foursquareApi
				.venuesSearch(ll, null, null, null, query, 50, null,
						categoryId, null, null, null, null, null);

		System.out.println("FSManager.java - Now using coordinates: " + ll);
		if (result.getMeta().getCode() == 200) {
			// if query was ok we can finally do something with the data
			System.out.println("\tOK! ");
			System.out.print("FSManager.java - Number of items: "
					+ result.getResult().getVenues().length + "\t");
			for (CompactVenue venue : result.getResult().getVenues()) {
				System.out.print(venue.getName() + "\t");
			}
			System.out.println("\nAgain OK! ");
			return result;

		} else {
			// TODO: Proper error handling
			System.out.println("Error occured: ");
			System.out.println("  code: " + result.getMeta().getCode());
			System.out.println("  type: " + result.getMeta().getErrorType());
			System.out
					.println("  detail: " + result.getMeta().getErrorDetail());
		}
		return result;
	}

	public Result<VenuesSearchResult> draw3(String coordinates, String query,
                                            String categoryId) {
		Result<VenuesSearchResult> result = null;
		try {
			result = collectVenues(coordinates, query, categoryId);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}

	public Result<UserGroup> friends() {
		Result<UserGroup> result = null;
		try {
			result = foursquareApi.usersFriends("self");
			for (CompactUser compactUser : result.getResult().getItems()){
				System.out.println(compactUser.getFirstName() + compactUser.getLastName());
			}
		} catch (FoursquareApiException e) {
			e.printStackTrace();
		}
		return result;
	}

	public CheckinGroup checkins() {
		CheckinGroup result = null;
		try {
			result = foursquareApi.user("self").getResult().getCheckins();
			for(Checkin checkin : result.getItems()){
				System.out.println(checkin.getVenue().getName());
				CompactUser compactUser = checkin.getUser();
				if(compactUser != null){
					String name = compactUser.getLastName();
				}
				checkin.getVenue().getName();
				checkin.getVenue().getLocation().getCity();
				checkin.getCreatedAt();
				checkin.getLocation();
			}
		} catch (FoursquareApiException e) {
			e.printStackTrace();
		}
		return result;
	}

	public Result<VenueHistoryGroup> venueHistory() {
		Result<VenueHistoryGroup> result = null;
		try {
			result = foursquareApi.usersVenueHistory("self", new Date().getTime(), 0L);
		} catch (FoursquareApiException e) {
			e.printStackTrace();
		}
		return result;
	}

	public List<Checkin> checkinHistory(int limit){
		List<Checkin> list = null;
		try {
			Result<CheckinGroup> result = foursquareApi.usersCheckins("self", limit, 0,0L, new Date().getTime());
			list = Arrays.asList(result.getResult().getItems());
		} catch (FoursquareApiException e) {
			e.printStackTrace();
		}
		return list;
	}

	public void postComment(String id) throws FoursquareApiException {
	    if(id.equals("5da30eaf120e640007e1a067")) {
            Result<Comment> resultC = foursquareApi.checkinsAddComment(id, "FS-Hi");
        }
	    String text = retrieveComments(id);
    }

	public Checkin retrieveCompleteCheckin(String id) throws FoursquareApiException {
		Result<Checkin> result = foursquareApi.checkin(id, "");
		return result.getResult();
	}

    public String retrieveComments(String id) throws FoursquareApiException {
		Checkin checkin = retrieveCompleteCheckin(id);
		String text = "";
		if(checkin != null){
		    if(checkin.getComments() != null && checkin.getComments().getItems() != null){
		        List<Comment> comments = Arrays.asList(checkin.getComments().getItems());
                for (Comment comment : comments) {
                    if(comment.getText() != null) {
                        if(comment.getUser() != null){
                            text += comment.getUser().getFirstName() + ": ";
                        }
                        text += comment.getText() + "; ";
                    }
                }
                System.out.println(text);
            }
            if(checkin.getPhotos() != null){
                PhotoGroup photoGroup = checkin.getPhotos();
                Long count = photoGroup.getCount();
                List<Photo> photos = Arrays.asList(photoGroup.getItems());
            }
		}
		return text;
	}

}