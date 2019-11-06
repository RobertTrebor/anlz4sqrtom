package de.lengsfeld.anlz4sqr.connect;

import com.github.scribejava.apis.Foursquare2Api;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.model.OAuth2AccessToken;
import com.github.scribejava.core.oauth.OAuth20Service;
import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.io.DefaultIOHandler;

import java.io.IOException;
import java.util.Scanner;
import java.util.concurrent.ExecutionException;

public class FSConnect implements FSConnector {

	private final String ID = ConnectProp.get("id");
	private final String SECRET = ConnectProp.get("secret");
	private final String CALLBACK = ConnectProp.get("callback");

	private OAuth20Service service;

	private static FSConnector instance = null;
	private FoursquareApi foursquareApi = null;

	private FSConnect() {
		String authToken = authorize();
		if(authToken != "") {
			foursquareApi = new FoursquareApi(ID, SECRET, CALLBACK, authToken, new DefaultIOHandler());
		} else {
			foursquareApi = new FoursquareApi(ID, SECRET, CALLBACK);
		}
	}

	public String authorize() {
		service = new ServiceBuilder(ID)
				.apiSecret(SECRET)
				.callback(CALLBACK)
				.build(Foursquare2Api.instance());
		final Scanner in = new Scanner(System.in);

		System.out.println("=== Foursquare2's OAuth Workflow ===");
		System.out.println();

		// Obtain the Authorization URL
		System.out.println("Fetching the Authorization URL...");
		final String authorizationUrl = service.getAuthorizationUrl();
		System.out.println("Got the Authorization URL!");
		System.out.println("Now go and authorize ScribeJava here:");
		System.out.println(authorizationUrl);
		System.out.println("And paste the authorization code here");
		System.out.print(">>");
		final String code = in.nextLine();
		System.out.println();
		return authorizeToken(code);
	}


	public String authorizeToken(String code){
		System.out.println("Trading the Authorization Code for an Access Token...");
		final OAuth2AccessToken accessToken;
		String authToken = "";
		try {
			accessToken = service.getAccessToken(code);
			System.out.println("Got the Access Token!");
			System.out.println("(The raw response looks like this: " + accessToken.getRawResponse() + "')");
			System.out.println();
			authToken = accessToken.getAccessToken();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		return authToken;
	}

	public static FSConnector getInstance() {
		if (instance == null) {
			instance = new FSConnect();
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
