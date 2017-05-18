package Shifts;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Created by George on 13/02/2017.
 * https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */
@Component
public class DbLoader implements CommandLineRunner {

    private final WorkerRepo workerRepo;
    private final ShiftRepo shiftRepo;

    @Autowired
    public DbLoader(WorkerRepo workerRepo, ShiftRepo shiftRpeo)
    {
        this.workerRepo = workerRepo;
        this.shiftRepo = shiftRpeo;
    }

    @Override
    public void run(String... strings) throws Exception {
        this.workerRepo.save(new Worker("Micahel",  "Scott",    "Regional Manager"));
        this.workerRepo.save(new Worker("Dwight",   "Schrute",  "Assistant To The Regional Manager"));
        this.workerRepo.save(new Worker("Jim",      "Halpert",  "Sales Rep"));
        this.workerRepo.save(new Worker("Pam",      "Beesly",   "Office Admin"));
        this.workerRepo.save(new Worker("Ryan",     "Howard",   ""));
        this.workerRepo.save(new Worker("Andy",     "Bernard",  ""));
        this.workerRepo.save(new Worker("Stanley",  "Hudson",   ""));
        this.workerRepo.save(new Worker("Kevin",    "Malone",   ""));
        this.workerRepo.save(new Worker("Meredith", "Palmer",   ""));
        this.workerRepo.save(new Worker("Angela",   "Martin",   "Accountant"));
        this.workerRepo.save(new Worker("Oscar",    "Martinez", ""));
        this.workerRepo.save(new Worker("Kelly",    "Kapoor",   ""));

        this.shiftRepo.save(new Shift("Monday", "Morning"));
        this.shiftRepo.save(new Shift("Monday", "Afternoon"));
        this.shiftRepo.save(new Shift("Monday", "Evening"));
    }
}