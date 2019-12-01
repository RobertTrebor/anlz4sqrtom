package de.lengsfeld.anlz4sqr.controller;

import org.jdom2.Attribute;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.primefaces.event.NodeSelectEvent;
import org.primefaces.model.DefaultTreeNode;
import org.primefaces.model.TreeNode;

import javax.annotation.PostConstruct;
import javax.enterprise.context.SessionScoped;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.util.List;


class MyObject implements Serializable {
	String cat;
	String id;

	public MyObject(String cat, String id) {
		super();
		this.cat = cat;
		this.id = id;
	}

	@Override
	public String toString() {
		return cat;
	}

	public String getId() {
		return id;
	}

	public String getCat() {
		return cat;
	}

}

@Named
@SessionScoped
public class CategoriesController implements Serializable{
	/**
	 *
	 */
	private static final long serialVersionUID = 1L;
	private TreeNode root;
	private TreeNode selectedNode;
	private String categoryId="";
	private String categoryName;


    public CategoriesController() {  }

    @PostConstruct
    public void init(){
        root = new DefaultTreeNode(new MyObject("root","0000"), null);
        TreeNode currentRoot = new DefaultTreeNode();

		System.out.println("XML Reader started...");
		Document doc = null;
		SAXBuilder b = new SAXBuilder();
		try {
			URL url = Thread.currentThread().getContextClassLoader().getResource("categories.xml");
			String filename = url.getFile();
			File file = new File(filename);
			//File file = new File(getClass().getClassLoader().getResource("categories.xml").getFile());
			doc = b.build(file);
			System.out.println(doc.toString());
			Element element = doc.getRootElement();
			currentRoot = root;
			selectedNode=currentRoot;
			readAllNodes(element, currentRoot);
		} catch (JDOMException | IOException e) {
			e.printStackTrace();
			System.out.println("File not found!");
		}
		System.out.println("Outside of Try Catch" + doc.toString());
	}

        
	public void readAllNodes(Element element, TreeNode currentRoot) {

		for (Element e : element.getChildren()) {
			List<Attribute> attr = e.getAttributes();
			String a = "";

			for (Attribute at : attr) {
				a += at.getValue();
			}

			System.out.print(e.getName() + ": " + a + "\t");
			System.out.println("..." + e.getTextTrim());
			TreeNode n = new DefaultTreeNode(new MyObject(
					e.getTextTrim(), a), currentRoot);
			System.out.println("************ ID is: " + a);


			System.out.println("THAT'S WHAT I WANT 1: " + ((MyObject) n.getData()).getId());
			System.out.println("Is it correct?");
			readAllNodes(e, n);
		}
	}
  
    public TreeNode getRoot() {
        return root;  
    }

	public TreeNode getSelectedNode() {
		System.out.println("CategoriesController.java - public TreeNode getSelectedNode()");
		if(selectedNode == null){
			selectedNode = getRoot();
		}
		return selectedNode;
	}

	public void setSelectedNode(TreeNode selectedNode) {
		System.out.print("CategoriesController.java - public void setSelectedNode(TreeNode selectedNode) {");
		this.selectedNode = selectedNode;
	}

	public String getCategoryId() {
		categoryId = ((MyObject) selectedNode.getData()).getId();
		System.out.println("CategoriesController.java - getCategoryId: selectedNode " + categoryId);
		return categoryId;
	}
	
	public String getCategoryName() {
		categoryName = ((MyObject) selectedNode.getData()).getCat();
		return categoryName;
	}
	
	public void onNodeSelect(NodeSelectEvent event) {

        FacesMessage message = new FacesMessage(FacesMessage.SEVERITY_INFO, "Selected", event.getTreeNode().toString());
		addMessage(message);
        //FacesContext.getCurrentInstance().addMessage(null, message);
    }

	public void addMessage(FacesMessage message) {
		FacesContext.getCurrentInstance().addMessage(null, message);
	}
}
