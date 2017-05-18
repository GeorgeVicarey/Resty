package Shifts;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

/**
 * Created by George on 28/02/2017.
 */
@Data
@Entity
public class Shift {


    private @Id @GeneratedValue Long id;
    private String Day;
    private String Name;

    private Shift(){}

    public Shift(String Day, String Name){
        this.Day = Day;
        this.Name = Name;
    }
}
