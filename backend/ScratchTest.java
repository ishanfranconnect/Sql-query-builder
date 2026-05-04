import java.util.*;
import java.util.regex.*;

public class ScratchTest {
    public static void main(String[] args) {
        String result = "customers.customer_id";
        Map<String, String> tableAliases = new HashMap<>();
        tableAliases.put("customers", "c");
        tableAliases.put("order_items", "o1");
        tableAliases.put("orders", "o");

        for (Map.Entry<String, String> entry : tableAliases.entrySet()) {
            System.out.println("Replacing: " + entry.getKey() + " with " + entry.getValue());
            String regex = "\\b" + Pattern.quote(entry.getKey()) + "\\.";
            result = result.replaceAll(regex, entry.getValue() + ".");
        }

        System.out.println("Result 1: " + result);

        String result2 = "SUM(order_items.price) as oi_total";
        for (Map.Entry<String, String> entry : tableAliases.entrySet()) {
            String regex = "\\b" + Pattern.quote(entry.getKey()) + "\\.";
            result2 = result2.replaceAll(regex, entry.getValue() + ".");
        }
        System.out.println("Result 2: " + result2);
    }
}
