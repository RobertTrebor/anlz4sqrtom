package de.lengsfeld.anlz4sqr.controller;

import de.lengsfeld.anlz4sqr.form.MapForm;
import org.primefaces.event.map.PointSelectEvent;
import org.primefaces.event.map.StateChangeEvent;
import org.primefaces.model.map.DefaultMapModel;
import org.primefaces.model.map.LatLng;
import org.primefaces.model.map.Marker;

import javax.annotation.PostConstruct;
import javax.enterprise.context.RequestScoped;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;

@Named
@RequestScoped
public class MapController {

	@Inject
	private MapForm form;

	@PostConstruct
	public void init(){
		form.setModel(new DefaultMapModel());
	}

	public void onStateChange(StateChangeEvent event) {
		/*
		LatLngBounds bounds = event.getBounds();
		int zoomLevel = event.getZoomLevel();

		addMessage(new FacesMessage(FacesMessage.SEVERITY_INFO, "Zoom Level",
				String.valueOf(zoomLevel)));
		addMessage(new FacesMessage(FacesMessage.SEVERITY_INFO, "Center", event
				.getCenter().toString()));
		addMessage(new FacesMessage(FacesMessage.SEVERITY_INFO, "NorthEast",
				bounds.getNorthEast().toString()));
		addMessage(new FacesMessage(FacesMessage.SEVERITY_INFO, "SouthWest",
				bounds.getSouthWest().toString()));
				*/
	}

	public void onPointSelect(PointSelectEvent event) {
		LatLng latlng = event.getLatLng();
		form.setLatitude(String.valueOf(latlng.getLat()));
		form.setLongitude(String.valueOf(latlng.getLng()));

		addMessage(new FacesMessage(FacesMessage.SEVERITY_INFO,
				"Point Selected", "Lat:" + latlng.getLat() + ", Lng:"
						+ latlng.getLng()));
	}

	public void addMessage(FacesMessage message) {
		FacesContext.getCurrentInstance().addMessage(null, message);
	}

	public void addMarker(Marker marker){
		form.getModel().addOverlay(marker);
	}
}
