package com.mahmud.productservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
class ProductServiceApplicationTests {

    @MockBean
    private RedisTemplate<String, String> redisTemplate;

    @Test
    void contextLoads() {
    }

}
