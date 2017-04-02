var http = require("http");
var fs = require("fs");

http.createServer(function(request, response){
  console.log("Client requested: " + request.url);
  if (request.url === "/") {
    fs.readFile("public/index.html", function(error, data) {
      if (error) throw error;
      response.end(data);
    });
  } else {
    fs.readFile("public" + request.url, function(error, data) {
      if (error) throw error;
      response.end(data);
    });
  }
}).listen(3000, function () {
  console.log('Listening on port 3000...')
});