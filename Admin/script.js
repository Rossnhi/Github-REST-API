let data;
let sha;
let encToken = "nNBvvuq9XRq2lWFXT/blYEIxHKPE0t5EZVtyDUjn9oOpVSbJ+RXYMA==";
let token;
let key;
let keyHash = "61c8793a2c0a215d9248199648c065bcaa7cba27ed6b39159562add0c7196515";
let salt = new Uint8Array([129, 224, 76, 93, 161, 34, 92, 210, 4, 215, 221, 74, 115, 185, 190, 159]);
let counter = new Uint8Array([11, 52, 117, 167, 170, 229, 41, 209, 133, 87, 67, 191, 176, 239, 85, 11]);
let enc = new TextEncoder();
let dec = new TextDecoder();

let keyInput = document.getElementById('key');
let keyButton = document.getElementById('sendKeyButton');
keyButton.addEventListener('click', authenticate);


let nameInput = document.getElementById('name');
let authorInput = document.getElementById('author');
let sendButton = document.getElementById('sendButton');
sendButton.addEventListener('click', sendData);

let nameList = document.getElementById('bookNameList');
let authorList = document.getElementById('bookAuthorList');

let authMsg = document.getElementById('hiddenOverlay');

getData() 

function getData() {
  var request = new XMLHttpRequest();
  // Set the event handler
  request.onreadystatechange = parseData;
  // Initialize the request
  request.open('get', 'https://api.github.com/repos/Rossnhi/Github-REST-API/contents/data.json', true);
  // Fire away!
  request.send();
}

function parseData() {
  // `this` will refer to the `XMLHTTPRequest` object that executes this function
  if(this.readyState === 4) {
    if (this.status === 200) {
      let resp = JSON.parse(this.responseText);
      data = JSON.parse(atob(resp.content));
      sha = resp.sha;
      insertIntoBookList();
    }
    else {
      console.log("something went wrong..! :(");
    }
  }
}

function insertIntoBookList() {
	for (let entry of data.books) {
		let name = document.createElement('li');
        name.textContent = entry.name;

        let author = document.createElement('li');
        author.textContent = entry.author;

        nameList.appendChild(name);
        authorList.appendChild(author);
	}
}

function sendData() {
  if (nameInput.value != "" && authorInput.value != "") {

    // update data variable
    data.books.push({"name" : nameInput.value, "author" : authorInput.value});

    // send http req to update data.json file to github api
    let request = new XMLHttpRequest();
    request.onreadystatechange = handleResponse;
    request.open("PUT", "https://api.github.com/repos/Rossnhi/Github-REST-API/contents/data.json");
    request.setRequestHeader("Authorization", "token " + token);
    request.setRequestHeader("Content-Type", "application/json");
    
    // the data to update the file with
    let reqData = {
      "message": "Added to list from local backend",
      "content": btoa(JSON.stringify(data)),
      "sha": sha
    };

    request.send(JSON.stringify(reqData));
  }
}

function handleResponse() {
  if(this.readyState === 4) {
    if (this.status === 200) {
      console.log("data sent successfully! :)");
      
      // update local display of the data
      let name = document.createElement('li');
      name.textContent = nameInput.value;
      
      let author = document.createElement('li');
      author.textContent = authorInput.value;
      
      nameList.appendChild(name);
      authorList.appendChild(author);
    }
    else if (this.status == 401){
      console.log("authentication failed! :(");
    }
    else {
      console.log("something went wrong..! :(");
    }
    // reset input field text
    nameInput.value = "";
    authorInput.value = "";
  }
}

async function authenticate() {
  if (keyInput.value != "") {
    key = keyInput.value;
    if (await hash(key) != keyHash) {
      keyInput.value = "";
      let authMsg = document.getElementById('authenticationMessage');
      authMsg.innerText = "Incorrect Key. Try again.";
      return;
    }
    decrypt();
    authMsg.style.visibility = "hidden";
  }
}

async function decrypt() {
  encToken = Uint8Array.from(atob(encToken), (c) => c.charCodeAt(null));
  let passKey = await getKeyMaterial();
  key = await getKey(passKey);
  token = await window.crypto.subtle.decrypt(
    { 
      name: "AES-CTR", 
      counter,
      length: 64 
    },
    key,
    encToken
  );
  token = dec.decode(token);
}

function getKeyMaterial() {
  key = enc.encode(key);
  return window.crypto.subtle.importKey(
    "raw",
    key,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
}

function getKey(pass) {
  return window.crypto.subtle.deriveKey(
    {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      pass,
      { "name": "AES-CTR", "length": 256},
      true,
      ["encrypt", "decrypt"]
  );
}

async function hash(message) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(message));           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}
