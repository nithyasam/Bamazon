var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('easy-table');
//====================================
//MYSQL connection parameters
//====================================
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "bamazon"
});
//====================================
//Question sets for inquirer prompt
//====================================
var question_set1 = [{
	name: "id",
	message: "Enter the Item Id of the product you want to purchase:"

},
{
	name: "quantity",
	message: "Enter the number of units of the product:"
}];
var question_set2 = [{
	name: "yORn",
	type: "rawlist",
	message: "Would you like to continue shopping",
	choices: ["Y", "N"]
}];
//====================================
//start when connection is established
//====================================
connection.connect(function(err) {
	if (err) throw err;
	start();
});
//====================================
//start the application
//====================================
function start(){
	console.log("\n====================================");
	console.log("\tAvailable items for sale");
	console.log("====================================\n");
	availableItems();
}
//====================================
//Display available items
//====================================
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
//====================================
//to continue shopping
//====================================
function continueShopping(){
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
//====================================
//show customer shopping menu
//====================================
function userOptions(){
	inquirer.prompt(question_set1).then(function(answer) {
		connection.query(
			"SELECT stock_quantity, price, product_sales FROM products WHERE ?",
			[{
				item_id : answer.id
			}], function(error, result){
				if (error) throw err;
				if(result[0].stock_quantity >= answer.quantity){
					var total_amount = result[0].price * answer.quantity;
					console.log("Item added to cart");
					console.log("Total cost of purchase: $"+
						total_amount+"\n");

					var newQuantity = result[0].stock_quantity - answer.quantity;
					var newProduct_Sales = result[0].product_sales + total_amount;
					connection.query(
						"UPDATE products SET ? WHERE ?",
						[{
							stock_quantity : newQuantity,
							product_sales : newProduct_Sales
						},
						{
							item_id : answer.id
						}], function(error){
							if (error) throw err;
							continueShopping();
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
							continueShopping();
						});
				}
			});
	});
}