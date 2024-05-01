package chr.ptr.emailserver.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
@NoArgsConstructor
@AllArgsConstructor
public class Email {

    @Id
    private String id;
    private String emailAddress;

    public Email(String email) {
        this.emailAddress = email;
    }


}
