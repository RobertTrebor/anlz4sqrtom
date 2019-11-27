package de.lengsfeld.anlz4sqr;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.InjectionPoint;
import java.util.logging.Logger;

@ApplicationScoped
public class LoggerProducer {

    @Produces
    public Logger logger(InjectionPoint injectionPoint){
        return Logger.getLogger(injectionPoint.getClass().getCanonicalName());
    }
}
