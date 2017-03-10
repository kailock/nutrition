/**
 * Created by kaitl on 2/13/2017.
 * Referenced from Vincent Wu! https://github.com/wuv21/info474-data-exploration
 */

$(document).ready(function() {
    d3.csv('nutrients.csv', function(error, data) {

        // populate food selection
        for(var i = 0; i < data.length; i++) {
            $('#foods').append($('<option></option>')
                .attr('value', data[i].Shrt_Desc)
                .text(data[i].Shrt_Desc));
        }

        // margins and dimensions
        var margin = {top: 50, right: 250, bottom: 100, left: 50};
        var width = 1000 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;

        // starting data
        var selectedFood = ['BUTTER,WITH SALT'];
        $('#foods').val(selectedFood);
        var nutrients = ["Carbohydrates", "Fiber", "Fat", "Protein", "Sugar"];
        var selectedData = [];

        var yScale;
        var xNutrientScale;
        var xFoodScale;

        var c10 = d3.scale.category10();

        var tooltip = d3.select("#visualization").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        function filterData() {
            //push data object with carb, fiber, fat, protein, etc. of food selected
            selectedData = [];

            data.forEach(function(d) {
                if($.inArray(d.Shrt_Desc, selectedFood) >= 0) {
                    nutrients.forEach(function(n) {
                        selectedData.push({
                            name: d.Shrt_Desc,
                            category: n,
                            grams: +d[n]
                        });
                    });
                }
            });
            console.log(selectedData);
        }

        var svg = d3.select('#visualization')
            .append('svg')
            .attr('width', 1000)
            .attr('height', 700);

        // Axes set up
        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")")
            .attr('width', width)
            .attr('height', height);

        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')');

        svg.append('text')
            .attr('transform', 'translate(' + ((width / 2) + margin.left - 20) + ',' + (height + margin.top + (margin.bottom / 2)) + ')')
            .text('Nutrients');

        svg.append('text')
            .attr('transform', 'translate(' + 12 + ', ' + ((height / 2) + margin.top + margin.bottom) + ') rotate(-90)')
            .text("Amount in Grams (g)");

        // Set scales (x axis is an ordinal scale with food nutrients)
        function setScales(data) {
            yScale = d3.scale.linear()
                .range([height, 0])
                .domain([0, 100]);

            xNutrientScale = d3.scale.ordinal()
                .rangeBands([0, width],.2)
                .domain(nutrients);

            xFoodScale = d3.scale.ordinal()
                .rangeRoundBands([0, xNutrientScale.rangeBand()], 0)
                .domain(selectedFood);

            // Static reference lines for daily recommended values
            // Fiber
            svg.append("line")
                .style("stroke", "lightgray")
                .attr("x1", 220)
                .attr("y1", yScale(13))
                .attr("x2", 320)
                .attr("y2", yScale(13));

            svg.append('text')
                .style("fill", "lightgray")
                .attr("x", 235)
                .attr("y", yScale(14))
                .text('~25 grams');

            // Fat
            svg.append("line")
                .style("stroke", "lightgray")
                .attr("x1", 350)
                .attr("y1", yScale(9))
                .attr("x2", 450)
                .attr("y2", yScale(9));

            svg.append('text')
                .style("fill", "lightgray")
                .attr("x", 345)
                .attr("y", yScale(10))
                .text('Under ~20 grams');

            // Protein
            svg.append("line")
                .style("stroke", "lightgray")
                .attr("x1", 480)
                .attr("y1", yScale(38))
                .attr("x2", 580)
                .attr("y2", yScale(38));

            svg.append('text')
                .style("fill", "lightgray")
                .attr("x", 495)
                .attr("y", yScale(39))
                .text('~50 grams');

            // Sugar
            svg.append("line")
                .style("stroke", "lightgray")
                .attr("x1", 610)
                .attr("y1", yScale(20))
                .attr("x2", 710)
                .attr("y2", yScale(20));

            svg.append('text')
                .style("fill", "lightgray")
                .attr("x", 605)
                .attr("y", yScale(21))
                .text('Under ~30 grams');
        }

        // Set axes
        function setAxes() {
            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left');

            var xAxis = d3.svg.axis()
                .scale(xNutrientScale)
                .orient('bottom');

            yAxisLabel.call(yAxis);
            xAxisLabel.call(xAxis);
        }

        // Draws bars
        function drawVis(data) {
            setScales(data);
            setAxes();
            var bars = g.selectAll('rect').data(data, function(d) {return d + Math.random()});

            bars.enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('width', xFoodScale.rangeBand())
                .attr('height', 0)
                .attr('fill', function(d) {return c10(d.name)})
                .attr('x', function(d) { return xNutrientScale(d.category) + xFoodScale(d.name)})
                .attr('y', function(d) { return yScale(d.grams)})
                .on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity",.9);
                        // tooltip shows recommended amount depending on nutrient
                        tooltip.html(function() {
                                if (d.category == "Protein") {
                                    return '<b>' + d.category + ": " + d.grams + " grams" + '</b><br>' + "About " + (d.grams / 50 * 100).toFixed(2) + "% of daily recommended amount";
                                } else if (d.category == "Carbohydrates") {
                                    return '<b>' + d.category + ": " + d.grams + " grams" + '</b><br>' + "About " + (d.grams / 225 * 100).toFixed(2) + "% of daily recommended amount";
                                } else if (d.category == "Fiber") {
                                    return '<b>' + d.category + ": " + d.grams + " grams" + '</b><br>' + "About " + (d.grams / 25 * 100).toFixed(2) + "% of daily recommended amount";
                                } else if (d.category == "Fat") {
                                    return '<b>' + d.category + ": " + d.grams + " grams" + '</b><br>' + "About " + (d.grams / 20 * 100).toFixed(2) + "% of daily maximum amount recommended";
                                } else {
                                    return '<b>' + d.category + ": " +d.grams + " grams" + '</b><br>' + "About " + (d.grams / 30 * 100).toFixed(2) + "% of daily maximum amount recommended";
                                }
                            })
                            .style("left",(d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            bars.exit().remove();
            bars.transition()
                .duration(500)
                .attr('width', xFoodScale.rangeBand())
                .attr('height', function(d) {return height - yScale(d.grams)})
                .attr('fill', function(d) {return c10(d.name)})
                .attr('x', function(d) {return xNutrientScale(d.category ) + xFoodScale(d.name)})
                .attr('y', function(d) {return yScale(d.grams)});


            // Legend setup - references https://bl.ocks.org/mbostock/3887051
            var legend = svg.selectAll(".legend").data(selectedFood, function(d) {return d});

            legend.enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {return "translate(60," + (i) * 20 + ")";});

            legend.append("rect")
                .attr("x", width - 50)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", c10);

            legend.append("text")
                .attr("x", width - 30)
                .attr("y", 15)
                .style("text-anchor", "start")
                .text(function(d) {return d});

            legend.exit().remove();
        }

        // Redraw graphic if different food is selected
        $('#foods').change(function() {
            selectedFood = [];

            $('#foods option:selected').each(function() {
                selectedFood.push($(this).text());
            });
            console.log(selectedFood);
            filterData();
            drawVis(selectedData);
        });

        filterData();
        drawVis(selectedData);
    });
});

