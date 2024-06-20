package sr.ice.server;

import Demo.Data;

public class DataServant implements Data {
    private final int id;
    private final String data = "Some shared data";

    public DataServant(int servantId) {
        this.id = servantId;
        System.out.println("Created a data servant (id: " + servantId + ")");
    }

    @Override
    public String getData(com.zeroc.Ice.Current current) {
        System.out.println("DataServant" + id + ": shared data");
        return data;
    }
}