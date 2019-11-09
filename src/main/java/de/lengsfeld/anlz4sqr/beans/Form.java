package de.lengsfeld.anlz4sqr.beans;

import lombok.Getter;
import lombok.Setter;

import javax.enterprise.context.SessionScoped;
import javax.inject.Named;
import java.io.Serializable;

@Getter
@Setter
@Named
@SessionScoped
public class Form implements Serializable {

	private static final long serialVersionUID = 1L;

	private String selectedComment;


}