package de.lengsfeld.anlz4sqr.beans;

import de.lengsfeld.anlz4sqr.connect.FSConnectWeb;
import de.lengsfeld.anlz4sqr.connect.FSConnector;
import de.lengsfeld.anlz4sqr.connect.FSManager;
import fi.foyt.foursquare.api.FoursquareApiException;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.Checkin;
import fi.foyt.foursquare.api.entities.VenueHistoryGroup;
import fi.foyt.foursquare.api.entities.VenuesSearchResult;
import org.primefaces.PrimeFaces;

import javax.enterprise.context.RequestScoped;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Named
@RequestScoped
public class BasicBean implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	private Form form;

	@Inject
	private MapBean mapBean;

	@Inject
	private CategoriesController categoriesController;


	private FSManager fsManager = new FSManager(FSConnectWeb.getInstance().getFoursquareApi());
	private FSConnector fsConnect = FSConnectWeb.getInstance();

	public BasicBean() {
		System.setProperty("java.net.useSystemProxies", "true");
	}

	public void connect() throws IOException {
		String authorizationCode = fsConnect.authorize();
		FacesContext facesContext = FacesContext.getCurrentInstance();
		HttpServletResponse response = (HttpServletResponse) facesContext.getExternalContext().getResponse();
		String sessionId = ";jsessionid=" + facesContext.getExternalContext().getSessionId(false);
		response.sendRedirect(authorizationCode + sessionId);
	}

	public void onStart(){
	    HttpServletRequest request = (HttpServletRequest) FacesContext.getCurrentInstance().getExternalContext().getRequest();
        //HttpServletResponse response = (HttpServletResponse) FacesContext.getCurrentInstance().getExternalContext().getResponse();
        Map map = request.getParameterMap();
        if(map.containsKey("code")){
        	String[] headers = (String[]) map.get("code");
			fsConnect.authorizeToken(headers[0]);
		}
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
			System.out.print("BasicBean.java - category: " + form.getCategory());
			form.setCoordinates(mapBean.getCoordinates());
			System.out.println("\t coordinates");
			Result<VenuesSearchResult> result = fsManager.draw3(form.getCoordinates(), form.getQuery(),
					form.getCategory());
			form.setVenues(Arrays.asList(result.getResult().getVenues()));
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
		List<Checkin> checkins = fsManager.checkinHistory(form.getNumCheckins());
        form.setCheckins(checkins);
	}

	public void loadCheckinsWithComments(){
		loadCheckins();
		List<Checkin> checkinsWithComments = new ArrayList<>();
		for(Checkin checkin : form.getCheckins()){
			Long l = checkin.getCreatedAt();
			String name = checkin.getVenue().getName();
			if(checkin.getComments() != null && checkin.getComments().getCount() != null && checkin.getComments().getCount() > 0) {
				checkinsWithComments.add(checkin);
			}
		}
		form.setCheckins(checkinsWithComments);
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