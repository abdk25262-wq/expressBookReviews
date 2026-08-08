const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session contains authorization data
    if (req.session.authorization) {
        // Retrieve the access token from the session
        let token = req.session.authorization['accessToken'];

        // Verify the JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // Authentication successful: attach user info to the request object
                req.user = user;
                next();
            } else {
                // Token is invalid or expired
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        // No authorization data found in the session (user is not logged in)
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
