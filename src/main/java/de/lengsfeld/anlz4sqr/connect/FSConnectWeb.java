package de.lengsfeld.anlz4sqr.connect;

import com.github.scribejava.apis.Foursquare2Api;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.model.OAuth2AccessToken;
import com.github.scribejava.core.oauth.OAuth20Service;
import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.io.DefaultIOHandler;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

public class FSConnectWeb implements FSConnector {

	private final String ID = System.getenv("ID");
	private final String SECRET = System.getenv("SECRET");
	private final String CALLBACK = System.getenv("CALLBACK");

	private OAuth20Service service;

	private static FSConnector instance = null;
	private FoursquareApi foursquareApi;

	private FSConnectWeb() {
		foursquareApi = new FoursquareApi(ID, SECRET, CALLBACK);
	}

	public String authorize(){
		service = new ServiceBuilder(ID)
				.apiSecret(SECRET)
				.callback(CALLBACK)
				.build(Foursquare2Api.instance());

		System.out.println("=== Foursquare2's OAuth Workflow ===");
		System.out.println();

		// Obtain the Authorization URL
		System.out.println("Fetching the Authorization URL...");
		final String authorizationUrl = service.getAuthorizationUrl();
		System.out.println(authorizationUrl);
		return authorizationUrl;
	}

	public String authorizeToken(String code) {
		final OAuth2AccessToken accessToken;
		String token = "";
		try {
			accessToken = service.getAccessToken(code);
			token = accessToken.getAccessToken();
			System.out.println("Got the Access Token!");
			System.out.println("(The raw response looks like this: " + accessToken.getRawResponse() + "')");
			System.out.println();
			foursquareApi = new FoursquareApi(ID, SECRET, CALLBACK, token, new DefaultIOHandler());
		} catch (IOException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}

		return token;
	}

	public static FSConnector getInstance() {
		if (instance == null) {
			instance = new FSConnectWeb();
		}
		return instance;
	}

	public FoursquareApi getFoursquareApi() {
		return foursquareApi;
	}

	public String getID() {
		return ID;
	}

}
