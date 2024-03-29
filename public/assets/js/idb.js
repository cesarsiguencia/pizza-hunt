// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

//for updating the indexedDB
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_pizza', { autoIncrement: true });
    // this will appear under IndexedDB in the broswer as our saved object to export to the database when we go online
};

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      // we haven't created this yet, but we will soon, so let's comment it out for now
      uploadPizza();
      // if not online, the object will go straight to the saveRecord
    }
};
  
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

//save pizza data to IndexedDB
// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // transaction is a temporary connection of the database
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // add record to your store with add method, this will run if the add-pizza.js form submission fetch  function . catch()method is executed, or the error message if unable to fetch request due to bad internet
    pizzaObjectStore.add(record);
}

// once IndexedDB saved the pizza to Application/IndexedDB, 
function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
  
    // more to come...

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/pizzas', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['new_pizza'], 'readwrite');
            // access the new_pizza object store
            const pizzaObjectStore = transaction.objectStore('new_pizza');
            // clear all items in your store
            pizzaObjectStore.clear();

            alert('All saved pizza has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
}

//this whole page will render in the addPizza.html, if we go offline somehow, the data will be saved by IndexedDB and uploaded when the browser detects that we have gone back online, it will trigger the uploadPizza function
window.addEventListener('online', uploadPizza)