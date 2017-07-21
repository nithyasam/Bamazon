var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('easy-table');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "bamazon"
});

var question_set1 = [{
	name: "choice",
	type: "rawlist",
	message: "Please select from the following choices",
	choices: ["View Products for Sale", 
	"View Low Inventory",
	"Add to Inventory",
	"Add New Product"]
}];

var question_set2 = [{
	name: "yORn",
	type: "rawlist",
	message: "Would you like to continue",
	choices: ["Y", "N"]
}];

var question_set3 = [{
	name: "id",
	message: "Enter the Item Id of the product you want to update:"

},
{
	name: "quantity",
	message: "Enter the quantity:"
}];

var question_set4 = [{
	name: "name",
	type: "input",
	message: "Enter the name of the product you want to add:"

},
{
	name: "department",
	type: "input",
	message: "Enter the department:"
},
{
	name: "price",
	type: "input",
	message: "Enter the unit price:",
	validate: function(value) {
		if (isNaN(value) === false) {
			return true;
		}
		return false;
	}
},
{
	name: "quantity",
	type: "input",
	message: "Enter the stock quantity:",
	validate: function(value) {
		if (isNaN(value) === false) {
			return true;
		}
		return false;
	}
}
];



connection.connect(function(err) {
	if (err) throw err;
	start();
});

function start(){
	inquirer.prompt(question_set1).then(function(answer){
		if(answer.choice == "View Products for Sale"){
			viewProducts();
		}
		else if(answer.choice == "View Low Inventory"){
			viewLowInventory();
		}
		else if(answer.choice == "Add to Inventory"){
			addToInventory();
		}
		else if(answer.choice == "Add New Product"){
			addNewProduct();
		}
	});
}

function display(results){
	var values =[];
	for(var i=0;i<results.length;i++){
		var row = {};
		row.item_id = results[i].item_id;
		row.product_name = results[i].product_name;
		row.department_name = results[i].department_name;
		row.price = results[i].price;
		row.stock_quantity = results[i].stock_quantity;
		values[i] = row;
	}

	var t = new Table;
	values.forEach(function(product) {
		t.cell('ITEM ID', product.item_id);
		t.cell('PRODUCT NAME', product.product_name)
		t.cell('DEPARTMENT', product.department_name)
		t.cell('PRICE, USD', product.price, Table.number(2))
		t.cell('STOCK QUANTITY', product.stock_quantity)
		t.newRow()
	});
	console.log(t.toString());
}

function viewProducts(){
	connection.query(
		"SELECT * from products",
		function(error, results) {
			if (error) throw err;
			else {
				display(results);
				continueManaging();
			}
		});
}

function viewLowInventory(){
	connection.query(
		"SELECT * FROM products WHERE stock_quantity < 5",
		function(error, results) {
			if (error) throw err;
			else {
				display(results);
				continueManaging();
			}
		});
}

function addToInventory(){
	inquirer. 
	prompt(question_set3).then(function(answer){
		connection.query(
			"SELECT stock_quantity from products WHERE ?",
			[{
				item_id : answer.id
			}], function(error, result){
				if (error) throw err;
				var newQuantity = parseInt(answer.quantity) + result[0].stock_quantity;
				connection.query(
					"UPDATE products SET ? WHERE ?",
					[{
						stock_quantity : newQuantity
					},
					{
						item_id : answer.id
					}], function(error){
						if (error) throw error;
						console.log("Stock updated");
						viewProducts();
					});
			});
	});

}

function addNewProduct(){
	inquirer. 
	prompt(question_set4).then(function(answer){
		connection.query(
			"INSERT INTO products SET ?",
			{
				product_name: answer.name,
				department_name: answer.department,
				price: answer.price,
				stock_quantity: answer.quantity
			}, function(error){
				if (error) throw error;
				else
					console.log("Product added.");
					viewProducts()
			});
	});
}

function continueManaging(){
	inquirer. 
	prompt(question_set2).then(function(answer){
		if(answer.yORn == 'Y'){
			start();
		}
		else if(answer.yORn == 'N'){
			process.exit();
		}
	});
}
