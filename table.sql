CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    contactNumber VARCHAR(15) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(250) NOT NULL,
    status VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    UNIQUE (email)
  );


insert into user(name,contactNumber,email,password,status,role) values('admin','+21658428749','asmataba04@gmail.com','loujich','true','admin');

CREATE TABLE category(
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
 name VARCHAR(255) NOT NULL,
);
create table product (
  id int not null auto_increment PRIMARY KEY,
  name varchar(255) not null ,
  categoryID integer NOT NULL,
  description varchar(255),
  price integer,
  status varchar(20),
  Tasty INT(10) , 
  Tasty_lounge INT (10)
  CHECK (Tasty IN (0, 1)),
  CHECK (Tasty_lounge IN (0, 1))
) ;

CREATE TABLE bill(
  id int not null AUTO_INCREMENT PRIMARY KEY,
  uuid varchar(200) not null,
  name varchar(255) not null ,
  email varchar(2555) not null,
  contactNumber varchar(20) not null,
  TASTY ENUM('1', '2') NOT NULL,
  paymentMethod varchar(50) not null,
  total int not null,
  productdetails json default null,
  createdBY varchar(255) not null 
);
