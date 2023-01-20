function dumpResponse() {
  // `this` will refer to the `XMLHTTPRequest` object that executes this function
  console.log(this.responseText);
}
var request = new XMLHttpRequest();
// Set the event handler
request.onload = dumpResponse;
// Initialize the request
request.open('get', 'https://api.github.com/users/rossnhi', true);
// Fire away!
request.send();

const data = `<html> <head> </head> <body> <h1> HEY THIS IS WORKING!</h1></body></html>`;              //sample json
const a = document.createElement('a');
const blob = new Blob([data], {type: "text/html"});
a.href = URL.createObjectURL(blob);
a.download = 'test';                     //filename to download
a.click();