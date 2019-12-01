package de.lengsfeld.anlz4sqr.form;

import lombok.Getter;
import lombok.Setter;
import org.primefaces.model.map.MapModel;

import javax.enterprise.context.SessionScoped;
import javax.inject.Named;
import java.io.Serializable;

@Getter
@Setter
@Named
@SessionScoped
public class MapForm implements Serializable {
	
	private static final long serialVersionUID = 1L;

	private MapModel model;
	private String latitude = "52.531227";
	private String longitude = "13.403921";

	public String getCoordinates() {
		return latitude + "," + longitude;
	}

}
