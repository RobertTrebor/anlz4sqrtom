package de.lengsfeld.anlz4sqr.beans;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

@Named
@RequestScoped
public class BasicBean {

    @Inject
    private Form form;

    public void onStart(){
        form.setSelectedComment("New Robert");
    }
}