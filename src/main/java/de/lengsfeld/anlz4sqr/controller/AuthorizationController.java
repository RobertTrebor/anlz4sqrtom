package de.lengsfeld.anlz4sqr.controller;

import de.lengsfeld.anlz4sqr.connect.FSConnectWeb;
import de.lengsfeld.anlz4sqr.connect.FSManager;
import java.io.IOException;
import java.io.Serializable;
import java.util.Map;
import javax.annotation.PostConstruct;
import javax.enterprise.context.RequestScoped;
import javax.faces.application.NavigationHandler;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Named
@RequestScoped
public class AuthorizationController implements Serializable {

	@Inject
    private FSConnectWeb fsConnect;


    private FSManager fsManager;

	@PostConstruct
    public void init(){
        System.setProperty("java.net.useSystemProxies", "true");
	    fsManager = new FSManager(fsConnect.getFoursquareApi());
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
		if (map.containsKey("code")) {
			String[] headers = (String[]) map.get("code");
			fsConnect.authorizeToken(headers[0]);
		}
		NavigationHandler navigationHandler = FacesContext.getCurrentInstance().getApplication().getNavigationHandler();
		navigationHandler.handleNavigation(FacesContext.getCurrentInstance(), "authorize", "index?faces-redirect=true");

    }



}
