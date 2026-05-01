package com.smartquerybuilder.service;

import com.smartquerybuilder.dto.SavedQueryRequest;
import com.smartquerybuilder.entity.SavedQuery;
import com.smartquerybuilder.entity.User;
import com.smartquerybuilder.repository.SavedQueryRepository;
import com.smartquerybuilder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedQueryService {

    private final SavedQueryRepository savedQueryRepository;
    private final UserRepository userRepository;

    public SavedQuery save(String email, SavedQueryRequest request, String sql) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        SavedQuery query = new SavedQuery();
        query.setName(request.name());
        query.setQueryJson(request.queryJson());
        query.setGeneratedSql(sql);
        query.setUser(user);
        return savedQueryRepository.save(query);
    }

    public List<SavedQuery> list(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return savedQueryRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void delete(Long id) {
        savedQueryRepository.deleteById(id);
    }
}
