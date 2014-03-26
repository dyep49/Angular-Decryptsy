app.directive('d3History', ['d3Service', '$interval', function(d3Service, $interval){

	var margin = {top: 20, right: 30, bottom: 20, left: 80};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

	return {
		restrict: 'EA',
		scope:{
			candlestick: '=',
			trade: '='
		},
		link: function(scope, element, atrs){
			d3Service.d3().then(function(d3){

				var svg = d3.select(element[0])
					.append('svg')
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  	.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				scope.$watch('trade', function(newVal, oldVal){
					console.log('preparing to rerender')
					setTimeout(function(){
						scope.render(scope.candlestick, scope.trade)
					}, 2000)
				});

				// $interval(function(){
				// 	scope.render(scope.candlestick, scope.trade)
				// }, 5000)

				scope.render = function(candlestick_history, trade_history){

					svg.selectAll('*').remove();


					var min_x = d3.min(candlestick_history, function(d){return d.open_datetime})
					
					var max_x = new Date()
					var x = d3.time.scale()
						.domain([min_x, max_x])
						.range([0, width])

					var y = d3.scale.linear()
						.domain(d3.extent(trade_history, function(d){return d.price}))
						.range([height - 20, 0 + 20])

					function make_x_axis() {		
				    return d3.svg.axis()
				        .scale(x)
				        .orient("bottom")
				        .ticks(5)
					}

					function make_y_axis() {		
				    return d3.svg.axis()
				        .scale(y)
				        .orient("left")
				        .ticks(8)
					}



					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom").ticks(5);

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left").ticks(8)

					var line = d3.svg.line()
						.x(function(d){return x(d.datetime)})
						.y(function(d){return y(d.price)})

					svg.append("path")
						.attr("id", "black")
						.attr("d", line(trade_history))

					svg.append('g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0,' + height + ')')
						.call(xAxis)

					svg.append('g')
						.attr('class', 'y axis')
						.call(yAxis)

					svg.selectAll('rect')
						.data(candlestick_history)
						.enter().append("svg:rect")
						.attr('x', function(d) {return x(d.open_datetime)})
						.attr('y', function(d) {return y(_.max([d.open, d.close]))})
						.attr('height', function(d) {return Math.abs(y(d.open)-y(d.close))})
						.attr('width', function(d){return .1 * (width - 2*margin.top)/candlestick_history.length})
						.attr('fill', function(d){return d.open < d.close ? "green" : "red"})
					
					svg.selectAll('line.stem')
						.data(candlestick_history)
						.enter().append('svg:line')
						.attr('class', 'stem')
						.attr('x1', function(d){return x(d.open_datetime) + .05 * (width - 2 * margin.top)/ candlestick_history.length})
						.attr('x2', function(d){return x(d.open_datetime) + .05 * (width - 2 * margin.top)/ candlestick_history.length})
						.attr('y1', function(d){return y(d.max)})
						.attr('y2', function(d){return y(d.min)})
						.attr('stroke', 'black')

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