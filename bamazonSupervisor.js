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
	message: "Choose from the following option",
	choices: ["View Product Sales by Department", "Create New Department"]
}];

var question_set2 = [{
	name: "department_name",
	type: "input",
	message: "Enter the name of the department:"

},
{
	name: "overhead_cost",
	type: "input",
	message: "Enter the overhead cost:",
	validate: function(value) {
		if (isNaN(value) === false) {
			return true;
		}
		return false;
	}
},
];

var question_set3 = [{
	name: "yORn",
	type: "rawlist",
	message: "Would you like to continue",
	choices: ["Y", "N"]
}];

connection.connect(function(err) {
	if (err) throw err;
	start();
});

function start(){
	inquirer.prompt(question_set1).then(function(answer){
		if(answer.choice == "View Product Sales by Department"){
			viewSalesByDepartment();
		}
		else if(answer.choice == "Create New Department"){
			createDepartment();
		}
	});
}

function viewSalesByDepartment(){
	var q = "select a.department_id, a.department_name, a.over_head_costs,"+ "temp.product_sales, (temp.product_sales -  a.over_head_costs) as" + " total_profit  from departments a JOIN" +
	"(select department_name,  sum(product_sales) as product_sales  from " + "products " +
	"GROUP BY department_name)as temp " +
	"ON a.department_name = temp.department_name";
	connection.query(q, function(error, results) {
		if (error) throw error;
		else {
			var values =[];
			for(var i=0;i<results.length;i++){
				var row = {};
				row.department_id = results[i].department_id;
				row.department_name = results[i].department_name;
				row.over_head_costs = results[i].over_head_costs;
				row.product_sales = results[i].product_sales;
				row.total_profit = results[i].total_profit;
				values[i] = row;
			}

			var t = new Table;
			values.forEach(function(entry) {
				t.cell('DEPARTMENT ID', entry.department_id)
				t.cell('DEPARTMENT NAME', entry.department_name)
				t.cell('OVER HEAR COSTS', entry.over_head_costs)
				t.cell('PRODUCT Sales', entry.product_sales)
				t.cell('TOTAL PROFIT', entry.total_profit)
				t.newRow()
			});
			console.log(t.toString());
		}
		continueSupervising();
	});	
}

function createDepartment(){
	inquirer.prompt(question_set2).then(function(answer){
		connection.query(
			"INSERT INTO departments SET ?",
			{
				department_name: answer.department_name,
				over_head_costs: answer.overhead_cost,
			}, function(error){
				if (error) throw error;
				else
					console.log("Department added.");
			});
		continueSupervising();
	});
}

function continueSupervising(){
	inquirer. 
	prompt(question_set3).then(function(answer){
		if(answer.yORn == 'Y'){
			start();
		}
		else if(answer.yORn == 'N'){
			process.exit();
		}
	});
}