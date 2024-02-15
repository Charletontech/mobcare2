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

  
  // var sql = 'CREATE DATABASE IF NOT EXISTS mobcare' ;
  // connection.query(sql, (err, result) => { 
  //   if (err) throw err
  //     console.log('result:', result)
  // })
    
  var sql = 'CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY,  accountNumber VARCHAR(20), firstName VARCHAR(255), middleName VARCHAR(255), lastName VARCHAR(255), gender VARCHAR(255),  dob VARCHAR(255), email VARCHAR(255),  phoneNumber VARCHAR(255), password VARCHAR(255), phoneWorth VARCHAR(255), phoneModel VARCHAR(255), phoneBrand VARCHAR(255), phoneColor VARCHAR(255), address VARCHAR(255), plan VARCHAR(255), referrer VARCHAR(255) )' ;
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
  connection.end();
})




app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'index.html');
  res.sendFile(filePath);
});


app.get('/tt', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'customerDashboard.html');
  res.sendFile(filePath);
});


app.get('/signup', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'signup.html');
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

// app.get('/customer', (req, res) => {
//   check(prod())
//   function prod(params) {
//     var prod = 'why'
//     return prod
//   }
//   function check(a) {
//     console.log(a);
//   }
// })

app.post('/customer-signup', (req, res) => {
  //PROCESSING DATA FROM FORM
  var {firstName, middleName, lastName, email, dob, gender, phone, model, referrer, brand, color, worth, plan, address} = req.body
  
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
          // if (username === 'superAdmin' && password === '000') {
          //   req.session.user = 'superAdmin';
          //   req.session.save()
          //   res.redirect('/admin')
          // }else{
          //   res.render('badCredentials')
          //  }
         res.send('Bad Credentials: wrong email or password')

        } 
   })
});


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
              res.render('customerDashboard', {phoneNumber, accountNumber, firstName, lastName, balance, plan1, plan2, numberOfPlans, lastMonthSubscribed1, lastMonthSubscribed2, message})
          } else {
              console.log('Matching results found:', results2);
          }
      }
  });
  

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
 })

app.post('/fund-wallet', (req, res) => {
  let acctId = req.body.acctNo

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
   host: '196.46.20.76',
   path: `/clients/v1/accounts/${acctId}/_balance`,
   port: 3021,
   method: 'GET',
   headers: {
       'Authorization': `Bearer ${token}`
   }
};

function OnResponse(response) { 
    let data = ''; // This will store the page we're downloading.
    response.on('data', function(chunk) { // Executed whenever a chunk is received.
        data += chunk; // Append each chunk to the data variable.
    });

    response.on('end', function() {
        console.log(data);
    });
}


   
    http.request(urldata, OnResponse).end();
  //   const options = {
  //     hostname: '196.46.20.76',
  //     port: 3021,
  //     path: `/clients/v1/accounts/${acctId}/_balance`,
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`
  //     }
  //   };
  
  //   const req = http.request(options, (res) => {
  //     let data = '';
  
  //     res.on('data', (chunk) => {
  //       data += chunk;
  //     });
  
  //     res.on('end', () => {
  //       console.log(data); // Here you can handle the response data
  //     });
  //   });
  
  //   req.on('error', (error) => {
  //     console.error('Error:', error);
  //   });
  
  //   req.end();
  }
})


app.post('/test', (req, res) => {
  //PROCESSING DATA FROM FORM
  var {firstName, middleName, lastName, email, password, dob, gender, phone, model, referrer, brand, color, worth, plan, address} = req.body
  console.log(req.body);
  // //LOGIC TO CHECK IF PHONE NUMBER OR EMAIL ALREADY EXISTS
  // var sql = `SELECT * FROM customers`
  // connection.query(sql, (err, result1) => { 
  //   if (err) throw err
  //     console.log('result:', result1)
  //     const user = result1.find((result) => {
  //       return result.username === username && result.password == hashedPassword;
  //       });
  // })
  
  
  
  //LOGIC TO CONVERT DATE TO REQUIRED FORMAT
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
  hash.update(password);
  const hashedPassword = hash.digest('hex');
   
  var formData = {
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    email: email,
    dob: convertedDate,
    gender: gender,
    phone: phone,
    model: model,
    referrer: referrer,
    brand: brand,
    color: color,
    worth: worth,
    plan: plan,
    address: address
  }

  
   //LOGIC TO GENETRATE TOKEN AND LOGON
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
      console.log(parsedRecievedLogonData)
       //LOGIC TO CREATE BANK WALLET        
        const walletCreationRequestData = JSON.stringify({
          phoneNumber: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          gender: formData.gender,
          dateOfBirth: formData.dob,
          productCode: "214",
          email: formData.email,
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
            'Authorization': `Bearer ${parsedRecievedLogonData.token}`
          },
        };
        
        const httpRequestSender = http.request(requestOptions, (response2) => {
          let data2 = '';
        
          response2.on('data', (chunk) => {
            data2 += chunk;
          });
        
          response2.on('end', () => {
            var newAccoutDetails = JSON.parse(data2);
            console.log(newAccoutDetails);
            
          //sending the notification to the user
            const accountNumber = newAccoutDetails.account
            var fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`
            res.render('notify', {accountNumber, fullName})


          // Mailing sign up details to Admin
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
              to: `adsbyshante@gmail.com`,
              subject: `New user! ${formData.firstName} ${formData.middleName} ${formData.lastName}`,
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
                    <p>Full Name: ${formData.firstName} ${formData.middleName} ${formData.lastName}</p>
                    <p>Account Number: ${accountNumber}</p>
                    <p>Phone Number: ${formData.phone}</p>
                    <p>Phone Model: ${formData.model}</p>
                    <p>Phone Brand: ${formData.brand}</p>
                    <p>Phone Color:${formData.color}</p>
                    <p>Insurance Plan: ${formData.plan}</p>
                    <p>Customer Address: ${formData.address}</p>
                    <p>Name Of Referrer: ${formData.referrer}</p>
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
        
          });
       });
        
        httpRequestSender.on('error', (error) => {
          console.error('Error in HTTP request:', error.message);
          var errorMessage = error.message
          res.render('notify', {errorMessage, message: 'Not Successful'})
        });
        
        httpRequestSender.write(walletCreationRequestData);
        httpRequestSender.end();
            
      })

  })
  logonHttpSender.on('error', (error) => {
    console.error('Error in HTTP request:', error.message);
    var errorMessage = error.message
    res.render('notify', {errorMessage, message: 'Not Successful'})
  });

  logonHttpSender.write(logonRequestData);
  logonHttpSender.end();
})




app.listen(3000, () => {
  console.log('Listening at port 3000...');
});
