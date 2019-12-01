package de.lengsfeld.anlz4sqr.controller;

import de.lengsfeld.anlz4sqr.connect.FSConnectWeb;
import java.io.IOException;
import java.util.Map;
import javax.enterprise.context.RequestScoped;
import javax.faces.application.NavigationHandler;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Named
@RequestScoped
public class AuthorizationController {

	@Inject
    private FSConnectWeb fsConnect;

	public void connect() throws IOException {
		String authorizationCode = fsConnect.authorize();
		FacesContext facesContext = FacesContext.getCurrentInstance();
		HttpServletResponse response = (HttpServletResponse) facesContext.getExternalContext().getResponse();
		String sessionId = ";jsessionid=" + facesContext.getExternalContext().getSessionId(false);
		response.sendRedirect(authorizationCode + sessionId);
	}

	public void onStart(){

		HttpServletRequest request = (HttpServletRequest) FacesContext.getCurrentInstance().getExternalContext().getRequest();
		Map map = request.getParameterMap();
		if (map.containsKey("code")) {
			String[] headers = (String[]) map.get("code");
			fsConnect.authorizeToken(headers[0]);
		}
		NavigationHandler navigationHandler = FacesContext.getCurrentInstance().getApplication().getNavigationHandler();
		navigationHandler.handleNavigation(FacesContext.getCurrentInstance(), "authorize", "index?faces-redirect=true");

    }



}
