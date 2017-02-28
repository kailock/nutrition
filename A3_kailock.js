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
        var height = 700 - margin.top - margin.bottom;

        // starting data
        var selectedFood = ['BUTTER,WITH SALT'];
        $('#foods').val(selectedFood);
        var nutrients = ["Carbohydrt_(g)", "Fiber_TD_(g)", "Lipid_Tot_(g)", "Protein_(g)", "Sugar_Tot_(g)"];
        var selectedData = [];

        var yScale;
        var xNutrientScale;

        var c10 = d3.scale.category10();

        var tooltip = d3.select("#visualization").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        function filterData() {
            //push data object with carb, fiber, fat, protein, etc. of food selected

            selectedData = [];

            data.forEach(function(d) {
                if(d.Shrt_Desc == selectedFood[0]) {
                    nutrients.forEach(function(n) {
                        selectedData.push({
                            category: n,
                            grams: +d[n]
                        });
                    });
                }
            });
            console.log(selectedData);
            drawVis(selectedData);
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

        // Draws bats
        function drawVis(data) {

            setScales(data);
            setAxes();
            var bars = g.selectAll('rect').data(data);

            bars.enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('width', xNutrientScale.rangeBand())
                .attr('height', 0)
                .attr('fill', c10)
                .attr('x', function(d) { return xNutrientScale(d.category) })
                .attr('y', function(d) { return yScale(d.grams)})
                .on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity",.9);
                        // tooltip shows recommended amount depending on nutrient
                        tooltip.html(function() {
                                    if (d.category == "Protein_(g)") {
                                        return d.grams + " grams: About " + d.grams / 50 * 100 + "% of daily recommended amount";
                                    } else if (d.category == "Carbohydrt_(g)") {
                                        return d.grams + " grams: About " + d.grams / 225 * 100 + "% of daily recommended amount";
                                    } else if (d.category == "Fiber_TD_(g)") {
                                        return d.grams + " grams: About " + d.grams / 25 * 100 + "% of daily recommended amount";
                                    } else if (d.category == "Lipid_Tot_(g)") {
                                        return d.grams + " grams: About " + d.grams / 20 * 100 + "% of daily maximum amount recommended";
                                    } else {
                                        return d.grams + " grams: About " + d.grams / 30 * 100 + "% of daily maximum amount recommended";
                                    }
                                })
                                //d.category + ": " + d.grams)
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
                .attr('width', xNutrientScale.rangeBand())
                .attr('height', function(d) {return height - yScale(d.grams)})
                .attr('x', function(d) {return xNutrientScale(d.category)})
                .attr('y', function(d) {return yScale(d.grams)});

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

