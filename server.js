const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // Use bodyParser to parse form data
app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
  secret: 'mysecret', 
  resave: false, 
  saveUninitialized: true ,
  cookie: {
    sameSite:'lax'
  }
}));

// const connection = mysql.createConnection({
//       host: 'localhost',
//       user: 'root',
//       password: "",
//       port: 3306,
//       database: "mobcare"
//     });

    const connection = mysql.createConnection({
      host: 'db4free.net',
      user: 'phoenixdigital',
      password: "phoenix1",
      database: "phoenixdigital",
      port: 3306,
      });


app.get('/db-setup', (req, res) => {
   
  connection.connect((err) => {
    if (err) throw err
      console.log('connected to database ' +  connection.threadId) 
  })
    
  var sql = 'CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY,  accountNumber VARCHAR(20), firstName VARCHAR(255), middleName VARCHAR(255), lastName VARCHAR(255), gender VARCHAR(255),  dob VARCHAR(255), email VARCHAR(255),  phoneNumber VARCHAR(255), password VARCHAR(255), phoneWorth VARCHAR(255), phoneModel VARCHAR(255), phoneBrand VARCHAR(255), phoneColor VARCHAR(255), address VARCHAR(255), plan VARCHAR(255), referrer VARCHAR(255) )' ;
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS agents_requests (id INT AUTO_INCREMENT PRIMARY KEY,  name VARCHAR(255), dob VARCHAR(255), nin VARCHAR(255), email VARCHAR(255), phone VARCHAR(255), password VARCHAR(255),  address VARCHAR(255), agency VARCHAR(255) )' ;
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS agents (id INT AUTO_INCREMENT PRIMARY KEY,  name VARCHAR(255), dob VARCHAR(255), nin VARCHAR(255), email VARCHAR(255), phone VARCHAR(255), password VARCHAR(255),  address VARCHAR(255), agency VARCHAR(255) )' ;
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS plans_table (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255), balance VARCHAR(255),  plan1 VARCHAR(20), plan2 VARCHAR(20), numberOfPlans int(20), lastMonthSubscribed1 VARCHAR(255), lastMonthSubscribed2 VARCHAR(255), request VARCHAR(255) )'
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS appointments_table (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255),  date VARCHAR(20), status VARCHAR(20))'
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS repair_subscriptions (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255),  January VARCHAR(20), February VARCHAR(20), March VARCHAR(20), April VARCHAR(20), May VARCHAR(20), June VARCHAR(20), July VARCHAR(20), August VARCHAR(20), September VARCHAR(20), October VARCHAR(20), November VARCHAR(20), December VARCHAR(20))'
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  var sql = 'CREATE TABLE IF NOT EXISTS theft_subscriptions (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255),  January VARCHAR(20), February VARCHAR(20), March VARCHAR(20), April VARCHAR(20), May VARCHAR(20), June VARCHAR(20), July VARCHAR(20), August VARCHAR(20), September VARCHAR(20), October VARCHAR(20), November VARCHAR(20), December VARCHAR(20))'
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })
  
  var sql = 'CREATE TABLE IF NOT EXISTS purchase_subscriptions (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255),  January VARCHAR(20), February VARCHAR(20), March VARCHAR(20), April VARCHAR(20), May VARCHAR(20), June VARCHAR(20), July VARCHAR(20), August VARCHAR(20), September VARCHAR(20), October VARCHAR(20), November VARCHAR(20), December VARCHAR(20))'
  connection.query(sql, (err, result) => { 
    if (err) throw err
      console.log('result:', result)
  })

  connection.end();
})




app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'index.html');
  res.sendFile(filePath);
});


app.get('/signup', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'signup.html');
  res.sendFile(filePath);
});



app.get('/existing-customer', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'existing-customers.html');
  res.sendFile(filePath);
});


app.get('/login', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'login.html');
  res.sendFile(filePath);
});

app.get('/subscription', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'subscription.html');
  res.sendFile(filePath);
});


app.post('/existing-customer', (req, res) => {
  var {firstName, middleName, lastName, email, dob, gender, phone, accountEx, model, referrer, brand, color, worth, plan, address} = req.body
console.log(req.body);
  //logic to convert date to required format
  function convertDate(inputDate) {
    // Parse the input date (assuming yyyy-mm-dd format)
    const parsedDate = new Date(inputDate);
    // Format the date in the desired format (yyyy-mm-ddTHH:mm:ss.sssZ)
    const formattedDate = parsedDate.toISOString();
    return formattedDate;
  }
  const convertedDate = convertDate(dob);


  //LOGIC TO HASH PASSWORD
  const hash = crypto.createHash('sha256');
  hash.update(dob);
  const hashedPassword = hash.digest('hex');


   //Logic to capitalize plan
   function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  plan = capitalize(plan)


  //Logic to add user to database
  addUserToDatabase(accountEx)
  function addUserToDatabase(accountEx) {
    var sql = `INSERT INTO customers (firstName, middleName, lastName, accountNumber, gender,  dob, email,  phoneNumber, password, phoneWorth, phoneModel, phoneBrand, phoneColor, address, plan, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    var values = [firstName, middleName, lastName, accountEx,  gender,  dob, email, phone, hashedPassword, worth, model,  brand, color, address,  plan,  referrer]
    connection.query(sql, values, (err, result1) => { 
      if (err) throw err
    })

    var sql = "INSERT INTO plans_table (user, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, request) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    var values = [phone, 0, plan, "Nil", 1, "Nil", "Nil", 0]
    connection.query(sql, values, (err, result2) => {
      if (err) throw err
    })

    if (plan == 'Repair') {
      var sql = `INSERT INTO repair_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      var values = [phone, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
      connection.query(sql, values, (err, result) => { 
        if (err) throw err;
      });    
    } else {
      var sql = `INSERT INTO theft_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      var values = [phone, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
      connection.query(sql, values, (err, result) => { 
        if (err) throw err;
      });    
    }

    var fullName = firstName + " " + middleName + " " + lastName
    var acctNoParam = accountEx;
    res.render('notify', {fullName, acctNoParam})
    //signUpEmailNotification(accountEx)
  }

   

  //LOGIC TO SEND SIGN UP NOTIFICATION EMAIL TO USER
  function signUpEmailNotification(params) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.elasticemail.com',
      port: 2525, // Make sure port is specified as a number (not a string)
      secure: false, // Set secure as a boolean
      auth: {
        user: 'phoenixdigitalcrest@mail.com',
        pass: `${process.env.EMAIL_PASS}`,
      },
    });

  
    //Mail details
    const mailContent = {
      from: 'phoenixdigitalcrest@mail.com',
      to: `${email}`,
      subject: `New user! ${firstName} ${middleName} ${lastName}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          /* Reset styles for email clients */
          body, p {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
      
          /* Container */
          .container {
            background-color: white;
            padding: 20px;
          }
      
          /* Header */
          .header {
            background-color: #046599;
            color: white;
            text-align: center;
            padding: 12px 15px; 
          }
      
          /* Company Logo */
          .logo {
            text-align: center;
            margin-bottom: 20px;
            display: block;
            margin: auto;
          }
      
          /* Logo Image */
          .logo img {
            width: 100px; /* Adjust the size as needed */
            height: 100px; /* Adjust the size as needed */
            border-radius: 50%; /* Makes the logo round */
          }
      
          /* Content */
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 3px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: black;
            line-height: 1.4rem; 
          }
      
          h3{
            color:  #00a24a;
          }

          .token{
            color: rgb(38, 145, 38);
            letter-spacing: 3px;
          }
      
          /* Footer */
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
            <div class="logo">
            </div>
          <div class="header">
            
            <h1>New User</h1>
          </div>
          <div class="content">
            <p>
            <h3>Details:</h3>
            <p>Full Name: ${firstName} ${middleName} ${lastName}</p>
            <p>Account Number: ${params}</p>
            <p>Phone Number: ${phone}</p>
            <p>Phone Model: ${model}</p>
            <p>Phone Brand: ${brand}</p>
            <p>Phone Color:${color}</p>
            <p>Insurance Plan: ${plan}</p>
            <p>Customer Address: ${address}</p>
            <p>Name Of Referrer: ${referrer}</p>
            </p>
          </div>
          <div class="footer">
            <p>Mobcare &copy; 2024 </p>
          </div>
        </div>
      </body>
      </html> 
       `
     }

    //Sending the mail
    transporter.sendMail(mailContent, (error, info) =>{
      if (error){
        console.error('error sending mail', error)
      }else{
        console.log('Email sent', info.response)
       }
    })
  }
})


app.post('/customer-signup', (req, res) => {
  //PROCESSING DATA FROM FORM
  var {firstName, middleName, lastName, email, dob, gender, phone, model, referrer, brand, color, worth, plan, address} = req.body
  
  //Logic to capitalize plan
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  plan = capitalize(plan)


  //logic to convert date to required format
  function convertDate(inputDate) {
    // Parse the input date (assuming yyyy-mm-dd format)
    const parsedDate = new Date(inputDate);
    // Format the date in the desired format (yyyy-mm-ddTHH:mm:ss.sssZ)
    const formattedDate = parsedDate.toISOString();
    return formattedDate;
  }
  const convertedDate = convertDate(dob);

  //LOGIC TO HASH PASSWORD
  const hash = crypto.createHash('sha256');
  hash.update(dob);
  const hashedPassword = hash.digest('hex');



  //LOGIC TO CHECK IF PHONE NUMBER OR EMAIL ALREADY EXISTS
  var sql = `SELECT * FROM customers`;
  connection.query(sql, (err, result1) => { 
    if (err) throw err
    console.log(result1);
    const user = result1.find((result) => {
      return result.phoneNumber == phone || result.email == email;
    });
    if(user){
      res.send('user already exits')
    }else{
      tokenGenerator()
    }
  })

  
  //LOGIC TO GENERATE LOGON TOKEN
  function tokenGenerator() {
    var tokenData = '';
    var logonRequestData = JSON.stringify({
      "clientKey": `${process.env.CLIENT_KEY}`,
      "clientSecret": `${process.env.CLIENT_SECRET}`,
      "clientId": `${process.env.CLIENT_ID}`,
      "rememberMe": true
    })
  
    var logonRequestOptions = {
      hostname: '196.46.20.83',
      port: 3021,
      path: '/clients/v1/auth/_login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': logonRequestData.length,
      },
    };

    const logonHttpSender = http.request(logonRequestOptions, (response) =>{
      let = recievedLogonData = ''

      response.on('data', (chunk) => {
        recievedLogonData += chunk;
      });
    
      response.on('end', () => {
        var parsedRecievedLogonData = JSON.parse(recievedLogonData);
        tokenData = parsedRecievedLogonData.token
          walletNumberGenerator(tokenData)
      })
    })

    logonHttpSender.on('error', (error) => {
      console.error('Error in HTTP request:', error.message);
      var errorMessage = error.message
      res.render('notify', {errorMessage, message: 'Not Successful'})
    });
  
    logonHttpSender.write(logonRequestData);
    logonHttpSender.end();
  }

  


  //LOGIC TO GENERATE WALLET NUMBER (WALLET GENERATOR)
  function walletNumberGenerator(token) {
    var accountNumber;
    const walletCreationRequestData = JSON.stringify({
      phoneNumber: phone,
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      gender: gender,
      dateOfBirth: dob,
      productCode: "214",
      email: email,
      type: 1
    });

    
  // Setting up the options for the HTTP request
    const requestOptions = {
      hostname: '196.46.20.83',
      port: 3021,
      path: '/clients/v1/accounts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': walletCreationRequestData.length,
        'Authorization': `Bearer ${token}`
      },
    };
    
    const httpRequestSender = http.request(requestOptions, (response2) => {
      let data2 = '';
    
      response2.on('data', (chunk) => {
        data2 += chunk;
      });
    
      response2.on('end', () => {
        var newAccountDetails = JSON.parse(data2);
        accountNumber = newAccountDetails.account
        console.log(accountNumber);
        addUserToDatabase(accountNumber)
      })
    })

    httpRequestSender.on('error', (error) => {
      console.error('Error in HTTP request:', error.message);
      var errorMessage = error.message
      res.render('notifyError', {errorMessage, message: 'Not Successful'})
    });
    
    httpRequestSender.write(walletCreationRequestData);
    httpRequestSender.end();
  }

  //LOGIC TO ADD USER TO DATABASE
  function addUserToDatabase(acctNoParam) {
    var sql = `INSERT INTO customers (firstName, middleName, lastName, accountNumber, gender,  dob, email,  phoneNumber, password, phoneWorth, phoneModel, phoneBrand, phoneColor, address, plan, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    var values = [firstName, middleName, lastName, acctNoParam,  gender,  dob, email, phone, hashedPassword, worth, model,  brand, color, address,  plan,  referrer]
    connection.query(sql, values, (err, result1) => { 
      if (err) throw err
    })

    var sql = "INSERT INTO plans_table (user, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, request) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    var values = [phone, 0, plan, "Nil", 1, "Nil", "Nil", 0]
    connection.query(sql, values, (err, result2) => {
      if (err) throw err
    })

    if (plan == 'Repair') {
      var sql = `INSERT INTO repair_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      var values = [phone, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
      connection.query(sql, values, (err, result) => { 
        if (err) throw err;
      });    
    } else if(plan == 'Purchase'){
      var sql = `INSERT INTO purchase_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      var values = [phone, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
      connection.query(sql, values, (err, result) => { 
        if (err) throw err;
      });
    }  else {
      var sql = `INSERT INTO theft_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      var values = [phone, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
      connection.query(sql, values, (err, result) => { 
        if (err) throw err;
      });    
    }

    var fullName = firstName + " " + middleName + " " + lastName
    res.render('notify', {fullName, acctNoParam})
    signUpEmailNotification(acctNoParam)
  }

   

  //LOGIC TO SEND SIGN UP NOTIFICATION EMAIL TO USER
  function signUpEmailNotification(params) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.elasticemail.com',
      port: 2525, // Make sure port is specified as a number (not a string)
      secure: false, // Set secure as a boolean
      auth: {
        user: 'phoenixdigitalcrest@mail.com',
        pass: `${process.env.EMAIL_PASS}`,
      },
    });

  
    //Mail details
    const mailContent = {
      from: 'phoenixdigitalcrest@mail.com',
      to: `${email}`,
      subject: `New user! ${firstName} ${middleName} ${lastName}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          /* Reset styles for email clients */
          body, p {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
      
          /* Container */
          .container {
            background-color: white;
            padding: 20px;
          }
      
          /* Header */
          .header {
            background-color: #046599;
            color: white;
            text-align: center;
            padding: 12px 15px; 
          }
      
          /* Company Logo */
          .logo {
            text-align: center;
            margin-bottom: 20px;
            display: block;
            margin: auto;
          }
      
          /* Logo Image */
          .logo img {
            width: 100px; /* Adjust the size as needed */
            height: 100px; /* Adjust the size as needed */
            border-radius: 50%; /* Makes the logo round */
          }
      
          /* Content */
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 3px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: black;
            line-height: 1.4rem; 
          }
      
          h3{
            color:  #00a24a;
          }

          .token{
            color: rgb(38, 145, 38);
            letter-spacing: 3px;
          }
      
          /* Footer */
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
            <div class="logo">
            </div>
          <div class="header">
            
            <h1>New User</h1>
          </div>
          <div class="content">
            <p>
            <h3>Details:</h3>
            <p>Full Name: ${firstName} ${middleName} ${lastName}</p>
            <p>Account Number: ${params}</p>
            <p>Phone Number: ${phone}</p>
            <p>Phone Model: ${model}</p>
            <p>Phone Brand: ${brand}</p>
            <p>Phone Color:${color}</p>
            <p>Insurance Plan: ${plan}</p>
            <p>Customer Address: ${address}</p>
            <p>Name Of Referrer: ${referrer}</p>
            </p>
          </div>
          <div class="footer">
            <p>Mobcare &copy; 2024 </p>
          </div>
        </div>
      </body>
      </html> 
       `
     }

    //Sending the mail
    transporter.sendMail(mailContent, (error, info) =>{
      if (error){
        console.error('error sending mail', error)
      }else{
        console.log('Email sent', info.response)
       }
    })
  }
     
})


 // Login route
 app.post('/login', (req, res) => {   
   const phone = req.body.phone;
   const password = req.body.password;
   const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
   connection.query('SELECT * FROM customers', (err, results) => {
     if (err) throw err;
     const user = results.find((result) => {
       return result.phoneNumber == phone && result.password == hashedPassword;
      });
      if (user) {
        // console.log(user);
        req.session.user = user;
        req.session.save()
        res.cookie('user', user.phoneNumber)
        const mycookie = req.cookies.user //code to retrieve cookie
        res.redirect('/dashboard')
        
      } else{
          if (phone === '09063469709' && password === '1985-12-03') {
            req.session.user = 'superAdmin';
            req.session.save()
            res.redirect('/admin')
          }else{
            res.send('Bad Credentials: incorrect email or password')
           }

        } 
   })
});

app.get('/admin', async (req, res) => {
  try {
    var [customers, agents, agentRequest] = await Promise.all([getCustomers(), getAgents(), getAgentRequests()]);
    if (agentRequest.length === 0) {
      agentRequest = 'No data'
    }

    if (agents.length === 0) {
      agents = 'No data'
    }

    if (customers.length === 0) {
      customers = 'No data'
    }

    res.render('admin', { customers, agents, agentRequest });
   
  } catch (error) {
    console.error(error);
    // Handle errors appropriately
    res.status(500).send('Internal Server Error');
  }
});

function getCustomers() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM customers', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function getAgents() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM agents', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}


function getAgentRequests() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM agents_requests', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}


app.get('/dashboard', (req, res) => {
  var user = req.session.user;
  var phoneNumber = user.phoneNumber;
  var firstName = user.firstName;
  var lastName = user.lastName;
  var accountNumber = user.accountNumber;

  connection.query(`SELECT * FROM plans_table WHERE user = ${phoneNumber}`, (err, results) => {
    if (err) throw err;
    var balance = results[0].balance;
    var plan1 = results[0].plan1;
    var plan2 = results[0].plan2;
    var  numberOfPlans = results[0].numberOfPlans;
    var  lastMonthSubscribed1 = results[0].lastMonthSubscribed1;
    var  lastMonthSubscribed2 = results[0].lastMonthSubscribed2;
    
    //querying for appointments
    connection.query(`SELECT * FROM  appointments_table WHERE user = ${phoneNumber}`, (err, results2) => {
      var message = '';
      if (err) {
          console.error(err);
      } else {
          if (results2.length === 0) {
            message = 'You have no appointments yet.'
            subscriptionChecker(phoneNumber, accountNumber, firstName, lastName, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, message)
          } else {
              console.log('Matching results found:', results2);
          }
      }
  });

  function subscriptionChecker(phoneNumber, accountNumber, firstName, lastName, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, message) {
    var sql = `SELECT * FROM repair_subscriptions where user = '${phoneNumber}'`
    connection.query(sql, (err, repairPlanResult1) => {
      if (err) throw err
      var sql = `SELECT * FROM theft_subscriptions where user = '${phoneNumber}'`
      connection.query(sql, (err, theftPlanResult1) => {
        if (err) throw err
        var sql = `SELECT * FROM purchase_subscriptions where user = '${phoneNumber}'`
        connection.query(sql, (err, purchasePlanResult1) => {
          if (err) throw err
          var purchasePlanResult = purchasePlanResult1[0]
          var repairPlanResult = repairPlanResult1[0]
          var theftPlanResult = theftPlanResult1[0]
        
         res.render('customerDashboard', {phoneNumber, accountNumber, firstName, lastName, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, message, repairPlanResult, theftPlanResult, purchasePlanResult})
        })
      })
    })
  }
  })
})

app.post('/fix-appointment', (req, res) => {
  var sql = "INSERT INTO appointments_table  (user, date, status) VALUES (?, ?, ?)";
      var values = [phone, "Nil", plan, "Nil", 1, "Nil", "Nil"]
      connection.query(sql, values, (err, result2) => {
        if (err) throw err
      })

})


app.post('/request-claim', (req, res) => {
  var phone = req.body.phone
  var sql = `UPDATE plans_table SET request = '1' WHERE user = ${phone}`;
  connection.query(sql, (err, result) => {
    if (err) throw err
    res.sendStatus(200);
  })
})

app.post('/add-plan', (req, res) => {
  var {acctNo, planToAdd} = req.body;

  var sql = `UPDATE plans_table SET numberOfPlans = '2', plan2 = '${planToAdd}' WHERE user = ${acctNo}`
  connection.query(sql, (err, result) => {
    if (err) throw err
    res.sendStatus(200)
  })

  if (planToAdd == 'Repair') {
    var sql = `INSERT INTO repair_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var values = [acctNo, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"]; 
    connection.query(sql, values, (err, result) => { 
      if (err) throw err;
    });    
  } else {
    var sql = `INSERT INTO theft_subscriptions (user, January, February, March, April, May, June, July, August, September, October, November, December) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var values = [acctNo, "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled", "Disabled"];
    connection.query(sql, values, (err, result) => { 
      if (err) throw err;
    });
  }
})

app.post('/fund-wallet', (req, res) => {
  let acctId = req.body.acctNo
  let phone = req.body.phone
  tokenGenerator()
  function tokenGenerator() {
    var tokenData = '';
    var logonRequestData = JSON.stringify({
      "clientKey": `${process.env.CLIENT_KEY}`,
      "clientSecret": `${process.env.CLIENT_SECRET}`,
      "clientId": `${process.env.CLIENT_ID}`,
      "rememberMe": true
    })
  
    var logonRequestOptions = {
      hostname: '196.46.20.83',
      port: 3021,
      path: '/clients/v1/auth/_login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': logonRequestData.length,
      },
    };

    const logonHttpSender = http.request(logonRequestOptions, (response) =>{
      let = recievedLogonData = ''

      response.on('data', (chunk) => {
        recievedLogonData += chunk;
      });
    
      response.on('end', () => {
        var parsedRecievedLogonData = JSON.parse(recievedLogonData);
        tokenData = parsedRecievedLogonData.token
        //console.log(tokenData);
        balanceChecker(tokenData)
      })
    })

    logonHttpSender.on('error', (error) => {
      console.error('Error in HTTP request:', error.message);
      var errorMessage = error.message
      //res.render('notify', {errorMessage, message: 'Not Successful'})
    });
  
    logonHttpSender.write(logonRequestData);
    logonHttpSender.end();
  }


  function balanceChecker(token) {

  const urldata = {
    host: '196.46.20.83',
    path: `/clients/v1/accounts/${acctId}/_balance`,
    port: 3021,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
  };

  function OnResponse(response) { 
      let data = ''; 
      response.on('data', function(chunk) {
          data += chunk; 
      });

      response.on('end', function() {
        var recievedBalance = JSON.parse(data).balance
        console.log(recievedBalance);
        debitBalance(token, recievedBalance, acctId)
      });
    }
    
    http.request(urldata, OnResponse).end();
  }

  

    function debitBalance(token, receivedBalance, acctId) {
        // Define the payload
        const payload = JSON.stringify({
            "account": acctId, // Assuming acctId is the account number
            "reference": "001",
            "amount": 5, // Assuming receivedBalance is the amount to debit
            "description": "Debit for funding wallet - Mobcare",
            "channel": "1"
        });

        // Define the request options
        const options = {
            hostname: '196.46.20.83',
            port: 3021,
            path: '/clients/v1/transactions/_debit',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload) // Calculate the payload length
            }
        };

        // Create the HTTP request
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(data); // Log the response data
                var parsedData = JSON.parse(data)
                console.log(parsedData);
                responseToClient(parsedData, acctId, receivedBalance)
            });
        });

        // Handle errors
        req.on('error', (error) => {
            console.error('Error:', error);
        });

        // Send the request with the payload
        req.write(payload);
        req.end();


        
    }

    var resObj = res;
    
    function responseToClient(parsedData, acctId, receivedBalance) {
      if (parsedData.status == "Approved") {
        var sql = `UPDATE plans_table SET balance = '${receivedBalance}' WHERE user = ${phone} `;
        connection.query(sql, (err, result) =>{
          if (err) throw err;
        })
        resObj.status(200)
        resObj.json({ message: 'Success!', data: { someKey: 'someValue' } })
      }else{
        resObj.status(400)
      }
    }
})


app.post('/agent-signup', (req, res) => {
  var {name, dob, nin, email, phone, address, agency } = req.body
  
  var sql = 'SELECT * FROM agents'
  connection.query(sql, (err, result) => {
    if (err) throw err
    var agent = result.find(function (each) {
      return each.name == name || each.phone == phone
    })
    if (agent) {
      res.send('Agent already exists!')
    } else {
      addAgentToDatabase()
    }
  })

  function addAgentToDatabase() {
    var sql = 'INSERT INTO agents_requests (name, nin, email, phone, password, address, agency) VALUES (?, ?, ?, ?, ?, ?, ?)'
    var values = [name, nin, email, phone, dob, address, agency];
    connection.query(sql, values, (err, result1) => {
      if (err) throw err
      res.render('agentAccountCreated', {name})
    })
  }
})



app.get('/see-customer-details', (req, res) => {
  var id = req.query.id;
  connection.query(`SELECT *  FROM customers WHERE phoneNumber = '${id}'`,  (err, result1) => {
    if (err) throw err
    var customers = result1[0]
    queryRepair(customers)
  })

  function queryRepair(customers) {
    connection.query(`SELECT *  FROM repair_subscriptions WHERE user = '${id}'`,  (err, result1) => {
      if (err) throw err
      var repair = result1[0]
      queryTheft(customers, repair)
    })
  }

  function queryTheft(customers, repair) {
    connection.query(`SELECT *  FROM theft_subscriptions WHERE user = '${id}'`,  (err, result1) => {
      if (err) throw err
      var theft = result1[0]
      queryPurchase(customers, repair, theft)
    })
  }

  function queryPurchase(customers, repair, theft) {
    connection.query(`SELECT *  FROM purchase_subscriptions WHERE user = '${id}'`,  (err, result1) => {
      if (err) throw err
      var purchase = result1[0]
      res.render('customerDetail', { customers, repair, theft, purchase })
    })
  }
})


app.get('/see-approved-agent-details', (req, res) => {
  var id = req.query.id;
  connection.query(`SELECT *  FROM agents WHERE phone = '${id}'`,  (err, result1) => {
    if (err) throw err
    var result = result1[0]
    res.render('agentDetail', { result })
  })
})


app.get('/see-unverified-agent-details', (req, res) => {
  var id = req.query.id;
  connection.query(`SELECT *  FROM agents_requests WHERE phone = '${id}'`,  (err, result1) => {
    if (err) throw err
    var result = result1[0]
    res.render('newAgentDetail', { result })
  })
})

app.get('/save-agent', (req, res) => {
  var id = req.query.id;
  connection.query(`SELECT *  FROM agents_requests WHERE phone = '${id}'`,  (err, result1) => {
    if (err) throw err
    var result = result1[0]
    var { name, nin, email, phone, password, address, agency} = result;
    insertIntoAgentsTable( name, nin, email, phone, password, address, agency)
  })

  function insertIntoAgentsTable( name, nin, email, phone, password, address, agency) {
    var values = [name, nin, email, phone, password, address, agency]
    connection.query('INSERT INTO agents ( name, nin, email, phone, password, address, agency) VALUES (?, ?, ?, ?, ?, ?, ?)', values,  (err, result1) => {
      if (err){
        res.send('<h3>Operation Failed!</h3>')
        console.log(err);
      }else{
        connection.query(`DELETE FROM agents_requests WHERE phone = '${phone}'`, values,  (err, result1) => {
          if (err) throw err 
        })
        res.send('<h3 style="color: green">Agent approved!</h3>')
      }
    })
  }
})


app.get('/decline-agent', (req, res) => {
  var id = req.query.id;

  connection.query(`DELETE FROM agents_requests WHERE phone = '${id}'`, (err, result1) => {
    if (err) {
      console.log(err);
    }else{
      res.send('<h3 style="color: red">Agent declined!</h3>')
    }
  })
})


app.post('/enable-subscription-month-repair', (req, res) => {
  var {id, month} = req.body
  connection.query(`UPDATE repair_subscriptions SET ${month} = 'Enabled' WHERE user = '${id}'`, (err, result1) => {
    if (err) {
      console.log(err);
    }else{
      res.send('Month enabled')
    }
  })

})

app.post('/enable-subscription-month-theft', (req, res) => {
  var {id, month} = req.body
  connection.query(`UPDATE theft_subscriptions SET ${month} = 'Enabled' WHERE user = '${id}'`, (err, result1) => {
    if (err) {
      console.log(err);
    }else{
      res.send('Month enabled')
    }
  })

})



app.post('/enable-subscription-month-purchase', (req, res) => {
  var {id, month} = req.body
  connection.query(`UPDATE purchase_subscriptions SET ${month} = 'Enabled' WHERE user = '${id}'`, (err, result1) => {
    if (err) {
      console.log(err);
    }else{
      res.send('Month enabled')
    }
  })

})



app.listen(3000, () => {
  console.log('Listening at port 3000...');
});
