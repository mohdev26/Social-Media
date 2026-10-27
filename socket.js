const client = io("http://127.0.0.1:3000",{
    auth: {
        authorization: "token",
    },
        header:{
            auth: "mohamed"
        }

});



client.on("connect", () => {
  console.log("Server Establish Connection Successfully");
});

client.on("product", (data, callback) => {
  console.log(data);
  callback("I Recivied Your Message");
});
