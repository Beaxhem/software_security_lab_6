const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const port = 3000;

const { AuthenticationClient } = require("auth0");

const auth0 = new AuthenticationClient({
  domain: "kpi.eu.auth0.com",
  clientId: "JIvCO5c2IBHlAe2patn6l6q5H35qxti0",
  clientSecret:
    "ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB",
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

const verifyToken = (req, res, next) => {
  const access_token = req.headers.authorization;
  if (!access_token) {
    return next();
  }

  req.access_token = access_token;

  next();
};

app.get("/", verifyToken, (req, res) => {
  if (req.access_token) {
    return res.json({
      token: req.access_token,
      logout: "http://localhost:3000/logout",
    });
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/api/login", async (req, res) => {
  const { code } = req.body;

  try {
    const {
      data: { access_token },
    } = await auth0.oauth.authorizationCodeGrant({
      code,
      redirect_uri: "http://localhost:3000/",
    });

    if (access_token) {
      return res.json({ token: access_token });
    }

    throw new Error("Invalid credentials");
  } catch (e) {
    console.log(e);
    return res.status(401).send();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
