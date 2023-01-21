let data;
let nameList = document.getElementById('bookNameList');
let authorList = document.getElementById('bookAuthorList');

getData() 

function getData() {
  let request = new XMLHttpRequest();
  // Set the event handler
  request.onload = dumpResponse;
  // Initialize the request
  request.open('get', 'https://api.github.com/repos/Rossnhi/Github-REST-API/contents/data.json', true);
  // Fire away!
  request.send();
}

function dumpResponse() {
  let resp = JSON.parse(this.responseText);
  data = JSON.parse(atob(resp.content)); // resp.content will be base64 encoded atob() decodes it

  insertIntoBookList();

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
