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
	name: "id",
	message: "Enter the Item Id of the product you want to purchase:"
	
},
{
	name: "quantity",
	message: "Enter the number of units of the product:"
}];

connection.connect(function(err) {
	if (err) throw err;
	start();
});

function start(){
	console.log("\n========================");
	console.log("Available items for sale");
	console.log("========================\n");
	availableItems();
	
}

function availableItems(){
	connection.query(
		"SELECT * from products",
		function(error, results) {
			if (error) throw err;
			else {
				var values =[];
				for(var i=0;i<results.length;i++){
					var row = {};
					row.item_id = results[i].item_id;
					row.product_name = results[i].product_name;
					row.price = results[i].price;
					values[i] = row;
				}

				var t = new Table;
				values.forEach(function(product) {
					t.cell('ITEM ID', product.item_id);
					t.cell('PRODUCT NAME', product.product_name)
					t.cell('PRICE, USD', product.price, Table.number(2))
					t.newRow()
				});

				console.log(t.toString());
				userOptions();
			}
		});
}

function userOptions(){
	inquirer.prompt(question_set1).then(function(answer) {
		connection.query(
			"SELECT stock_quantity, price FROM products WHERE ?",
			[{
				item_id : answer.id
			}], function(error, result){
				if (error) throw err;
				if(result[0].stock_quantity >= answer.quantity){
					console.log("Item available for purchase");
					var newQuantity = result[0].stock_quantity - answer.quantity;
					connection.query(
						"UPDATE products SET ? WHERE ?",
						[{
							stock_quantity : newQuantity
						},
						{
							item_id : answer.id
						}], function(error){
							if (error) throw err;
							console.log("Product added to cart");
							console.log("Total cost of purchase: $"+
								result[0].price * answer.quantity);
						});
				}
				else{
					console.log("Insufficient quantity!");
					var newQuantity = answer.quantity - result[0].stock_quantity;
					connection.query(
						"UPDATE products SET ? WHERE ?",
						[{
							stock_quantity : newQuantity
						},
						{
							item_id : answer.id
						}], function(error){
							if (error) throw err;
							console.log("Product inventory will be updated soon!");
							console.log("Inventory updated!");
						});
				}
			});
	});
}