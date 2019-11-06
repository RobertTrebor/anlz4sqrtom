package de.lengsfeld.anlz4sqr.beans;

import de.lengsfeld.anlz4sqr.connect.FSConnectWeb;
import de.lengsfeld.anlz4sqr.connect.FSConnector;
import de.lengsfeld.anlz4sqr.connect.FSManager;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.VenuesSearchResult;

import javax.enterprise.context.RequestScoped;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serializable;
import java.util.Arrays;
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
			if (form.getCategory() == "0000") {
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
	public void update(){
		int view = form.getView();
		switch(view){
			case 0:
				loadResult();
				break;
			case 1:
				//loadHistory();
				break;
			case 2:
				//loadFromDb();
				break;
			case 3:
				//loadCheckins();
				break;
		}
	}

}