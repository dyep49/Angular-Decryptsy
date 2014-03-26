app.directive('d3Pump', ['d3Service', function(d3Service){
		var margin = {top: 20, right: 40, bottom: 20, left: 50};
		var width = 600 - margin.left - margin.right
		var height = 250 - margin.top - margin.bottom;

		return{
			restrict: 'EA',
			scope: {
				data: '='
			},
			link: function(scope, element, attrs){
				d3Service.d3().then(function(d3){

			var svg = d3.select(element[0])
				.append('svg')
				.attr('id', 'pump-graph')
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		  scope.$watch('data'), function(newVal, oldVal){
		  	scope.render(scope.data)
		  }

		  scope.render = function(coinpairs){
				var x_min = 0
				var x_max = 200

				var y_min = 0
				var y_max = d3.max(selection, function(coinpair){
					return coinpair.fourthWall
				})

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



			  var line = d3.svg.line()
					.x(function(d){return x(d.percentage)})
					.y(function(d){return y(d.quantity)})

				svg.append("path")
					.attr("id", "green")
					.attr("d", line(self.parse(selection[0])));

				svg.append("path")
					.attr("id", "red")
					.attr("d", line(self.parse(selection[1])));
				svg.append("path")
				.attr("id", "blue")
				.attr("d", line(self.parse(selection[2])));

				svg.append("path")
				.attr("id", "orange")
				.attr("d", line(self.parse(selection[3])));

				svg.append("path")
				.attr("id", "purple")
				.attr("d", line(self.parse(selection[4])));

				svg.append("text")
				    .attr("class", "x axis")
				    .attr("text-anchor", "end")
				    .attr("x", width)
				    .attr("y", height - 6)
				    .text("Percentage Increase in Price");

				svg.append("text")
				    .attr("class", "y axis")
				    .attr("text-anchor", "end")
				    .attr("y", 6)
				    .attr("dy", ".75em")
				    .attr("transform", "rotate(-90)")
				    .text("BTC Ask Quantity");

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