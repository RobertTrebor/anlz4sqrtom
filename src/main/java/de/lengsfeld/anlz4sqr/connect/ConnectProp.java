package de.lengsfeld.anlz4sqr.connect;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class ConnectProp {
	private static Properties props;

	private ConnectProp() {
	}

	static {
		props = new Properties();
		try {
			//InputStream in = ConnectProp.class.getResourceAsStream("fs.properties");
			InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream("fs.properties");
			props.load(in);
			in.close();
//			props.load(new BufferedInputStream(new FileInputStream(
//					"fs.properties")));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			System.out.println("###########################################");
			System.out.println("###########################################");
			System.out.println("Datei fs.properties nicht gefunden!");
			System.out.println("###########################################");
			System.out.println("###########################################");
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println("###########################################");
			System.out.println("###########################################");
			System.out.println("Datei fs.properties IO EXCEPTION!");
			System.out.println("###########################################");
			System.out.println("###########################################");
		}
	}

	public static String get(String key) {
		return props.getProperty(key);
	}
}
