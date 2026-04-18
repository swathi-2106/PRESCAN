package com.prescan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PrescanApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrescanApplication.class, args);

		System.out.print("System Started Successfully");
	}

}
