package de.lengsfeld.anlz4sqr.connect;

import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.FoursquareApiException;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.Category;

public class ConnectVenueCategories {
	
	private final String ID = ConnectProp.get("id");
	private final String SECRET = ConnectProp.get("secret");
	private final String CALLBACK = ConnectProp.get("callback");
	
	public Result<Category[]> venuesCategories() throws FoursquareApiException {
		
		System.setProperty("java.net.useSystemProxies", "true");

		FoursquareApi foursquareApi = new FoursquareApi(ID, SECRET, CALLBACK);

		// After client has been initialized we can make queries.
		Result<Category[]> result = foursquareApi.venuesCategories();

		System.out.println("Now using CATEGORIES: ");
		if (result.getMeta().getCode() == 200) {
			// if query was ok we can finally do something with the data
			System.out.println("OK! ");
			System.out.println("Number of items: " + result.getResult().length);
			int counter = 0; 
			for (Category c : result.getResult()) {
				System.out.print(c.getName());
				System.out.println("\t\t" + c.getId());
				for(Category subc : c.getCategories() ) {
					System.out.print(subc.getName());
					System.out.println("\t\t" + subc.getId());
					for(Category subsubc : subc.getCategories()) {
						System.out.print(subsubc.getName());
						System.out.println("\t\t\t" + subsubc.getId());
						System.out.println(subc.getCategories().length);
						counter += subc.getCategories().length;
					}
				}
			}
			System.out.println(counter);
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

	public Result<Category[]> draw4() {
		Result<Category[]> result = null;
		try {
			result = venuesCategories();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}
	
	public static void main(String[] args) {
		new ConnectVenueCategories().draw4();
	}

}