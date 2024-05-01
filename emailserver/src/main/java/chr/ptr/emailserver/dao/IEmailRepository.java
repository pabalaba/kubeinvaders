package chr.ptr.emailserver.dao;

import chr.ptr.emailserver.entity.Email;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface IEmailRepository extends MongoRepository<Email, String> {
}
