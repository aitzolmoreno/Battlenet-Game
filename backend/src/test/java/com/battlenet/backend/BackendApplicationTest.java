package com.battlenet.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BackendApplicationTest {
    
    @Autowired
    private ApplicationContext applicationContext;
    
    @Test
    void contextLoads() {
        assertNotNull(applicationContext, "Application context should not be null");
    }
    
    @Test
    void mainMethodStartsApplication() {
        assertDoesNotThrow(() -> {
            BackendApplication.main(new String[] {});
        });
    }
    
    @Test
    void applicationContextContainsExpectedBeans() {
        assertTrue(applicationContext.containsBean("backendApplication"), 
                "Application context should contain backendApplication bean");
    }
    
    @Test
    void applicationHasCorrectBeanDefinitionCount() {
        int beanCount = applicationContext.getBeanDefinitionCount();
        assertTrue(beanCount > 0, "Application context should have beans defined");
    }
}
