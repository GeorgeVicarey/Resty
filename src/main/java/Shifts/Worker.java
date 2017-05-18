package Shifts;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

/**
 * Created by George on 13/02/2017.
 */
@Data
@Entity
public class Worker {


    private @Id @GeneratedValue Long id;
    private String firstName;
    private String lastName;
    private String role;

    private @Version @JsonIgnore Long version;

    private Worker(){}

    public Worker(String firstName, String lastName, String role){
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
}
