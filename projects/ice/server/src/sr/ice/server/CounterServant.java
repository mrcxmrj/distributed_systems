package sr.ice.server;

import Demo.Counter;
import com.zeroc.Ice.Current;

public class CounterServant implements Counter {
    private final int id;
    private int currentCount;

    public CounterServant(int id, int count) {
        this.id = id;
        this.currentCount = count;
        System.out.println("Created a counter servant (id: " + id + ")");
    }

    @Override
    public int addToCounter(int value, Current current) {
        System.out.println("CounterServant" + id + ": incrementing counter by " + value + "; current count = " + currentCount);
        currentCount += value;
        return currentCount;
    }
}
