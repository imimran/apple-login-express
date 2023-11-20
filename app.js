const express = require("express");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
app.use(express.json());

async function getAppleSigningKey(kid) {
  const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
    // timeout: 30000
  });

  return await client.getSigningKey(kid);
}

app.post("/auth/login", async (req, res) => {
  console.log(req.body);

  const { provider, identityToken } = req.body;

  if (provider === "apple") {
    const json = jwt.decode(identityToken, { complete: true });

    console.log("json",json);

    const kid = json.header.kid;

    const appleKey = (await getAppleSigningKey(kid)).getPublicKey();
    console.log("appleKey", appleKey);

    const payload = jwt.verify(identityToken, appleKey);

    if(!payload){
        return res.json({message: "Something went wrong"})
    }

    console.log("Log in success ",payload);


    return res.json({message: "Verified"})
    
  }

});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
