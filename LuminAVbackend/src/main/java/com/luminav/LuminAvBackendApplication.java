package com.luminav;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LuminAvBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(LuminAvBackendApplication.class, args);
	}

}
