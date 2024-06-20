package sr.ice.server;

import com.zeroc.Ice.Current;
import com.zeroc.Ice.Object;
import com.zeroc.Ice.ServantLocator;

import java.util.HashMap;
import java.util.Map;

public class CounterServantLocator implements ServantLocator {
    private Map<String, CounterServant> servants = new HashMap<>();
    private int id = 1;

    public void finished(Current current, Object servant, java.lang.Object cookie) {
    }

    @Override
    public LocateResult locate(Current curr) {
        String name = curr.id.name;
        CounterServant dedicatedService = servants.get(name);
        if (dedicatedService == null) {
            dedicatedService = new CounterServant(id++, 0);
            servants.put(name, dedicatedService);
        }
        return new ServantLocator.LocateResult(dedicatedService, null);
    }

    public void deactivate(String category) {
    }

}