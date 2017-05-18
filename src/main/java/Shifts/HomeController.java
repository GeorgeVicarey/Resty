package Shifts;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by George on 13/02/2017.
 */
@Controller
public class HomeController {

    @RequestMapping("/")
    public String index() {
        return "index";
    }
}
