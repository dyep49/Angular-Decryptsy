app.directive('d3Line', ['d3Service', 'Depth', function(d3Service, Depth){

	var margin = {top: 20, right: 40, bottom: 20, left: 90};
	var width = 960 - margin.left - margin.right
	var height = 500 - margin.top - margin.bottom;


	return{
		restrict: 'EA',
		scope: {
			sell: '=',
			buy: '='
		},
		link: function(scope, element, attrs) {
			d3Service.d3().then(function(d3){

				var margin = {top: 20, right: 40, bottom: 20, left: 90};
				var width = 960 - margin.left - margin.right
				var height = 500 - margin.top - margin.bottom;

				var svg = d3.select(element[0])
					.append('svg')
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				scope.$watch('sell', function(newVal, oldVal){
					console.log('stuff')
					setTimeout(function(){
						scope.render(scope.buy, scope.sell)
					}, 1000)
				});


				scope.render = function(buy_data_array, sell_data_array){

					svg.selectAll('*').remove();

					if(!buy_data_array){
						debugger;
					}

					var x_min = d3.min(buy_data_array, function(order){return order.price})
					var x_max = d3.max(sell_data_array, function(order){return order.price})


					var y_max = d3.max(sell_data_array.concat(buy_data_array), function(order){return order.quantity})

					var x = d3.scale.linear()
						.domain([x_min, x_max])
						.range([0, width])

					var y = d3.scale.linear()
						.domain([0, y_max])
						.range([height, 0])

					function make_x_axis() {		
				    return d3.svg.axis()
				        .scale(x)
				        .orient("bottom")
				        .ticks(8)
					}					

					function make_y_axis() {		
				    return d3.svg.axis()
				        .scale(y)
				        .orient("left")
				        .ticks(8)
					}


					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(8)

					var yAxis = d3.svg.axis()
						.scale(y)
						.ticks(8)
						.orient("left");

					var	area = d3.svg.area()
				    .x(function(d) { return x(d.price);})
				    .y0(height)
				    .y1(function(d) { return y(d.quantity);});

					var line = d3.svg.line()
						.x(function(d){return x(d.price)})
						.y(function(d){return y(d.quantity)})


			    var bid_fill = svg.append("path")
			        .datum(buy_data_array)
			        .attr("class", "bid")
			        .attr("d", area)
			        .style('fill', 'green')
			        .style('opacity', 0.8)

			    var ask_fill = svg.append("path")
			        .datum(sell_data_array)
			        .attr("class", "ask")
			        .attr("d", area)
			        .style('fill', 'red')
			        .style('opacity', 0.8)

					svg.append("path")
						.attr("id", "green")
						.attr("d", line(buy_data_array))
						.transition()
						.duration(2000)

					svg.append("path")
						.attr("id", "red")
						.attr("d", line(sell_data_array))
						.transition()
						.duration(2000)

				
					svg.append("g")
						.attr("class", "x axis")
						.attr('transform', 'translate(0,' + height + ')')
						.call(xAxis);

					svg.append('g')
						.attr('class', 'y axis')
						.call(yAxis)

					var x_grid = svg.append("g")			
				    .attr("class", "grid")
				    .attr("transform", "translate(0," + height + ")")
				    .call(make_x_axis()
				        .tickSize(-height, 0, 0)
				        .tickFormat("")
			    )

			    var y_grid = svg.append("g")			
			        .attr("class", "grid")
			        .call(make_y_axis()
			            .tickSize(-width, 0, 0)
			            .tickFormat("")
			        )



				}
			})
		}



	}








}])