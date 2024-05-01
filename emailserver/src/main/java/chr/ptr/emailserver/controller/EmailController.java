package chr.ptr.emailserver.controller;

import chr.ptr.emailserver.dao.IEmailRepository;
import chr.ptr.emailserver.entity.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class EmailController {
    private final IEmailRepository emailRepository;

    @Autowired
    public EmailController(IEmailRepository emailRepository) {
        this.emailRepository = emailRepository;
    }

    @PostMapping("/share")
    public Email saveEmail(@RequestBody String email) {

        email = email.replaceAll("\"","");

        Email newEmail = new Email(email);
        return emailRepository.save(newEmail);
    }

    // GET method to retrieve all emails
    @GetMapping("/list")
    public List<Email> getAllEmails() {
        return emailRepository.findAll();
    }
}
