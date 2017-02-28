/**
 * Created by kaitl on 2/18/2017.
 */

// Graphic margins and dimensions
var width = 1000;
var height = 700;
var margin = {top: 20, right: 15, bottom: 30, left: 40};
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;

var dataset = [];
var attributes = ["Protein", "Fiber_TD"];
var maxFiber = 79;
var maxProtein = 88.32;
var ranges = [[0, maxProtein], [0, maxFiber]];


// read in all data before drawing axes
var testPromise = new Promise(
    function(resolve, reject) {
        d3.csv("nutrients.csv", function(error, nutrients) {
            if(error) return console.warn(error);
            nutrients.forEach(function(d) {
                var datasetObject = {
                    Shrt_Desc : d["Shrt_Desc"],
                    Protein : +d["Protein_(g)"],
                    Fiber_TD : +d["Fiber_TD_(g)"]
                };
                dataset.push(datasetObject);
            });

            console.log(dataset);
        });
        window.setTimeout(function(){
            resolve();
        }, 1500);
    }
);

// Draw axes
testPromise.then(
    function() {
        var x = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) {return d.Protein})])
            .range([0, w]);

        var y = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) {return d.Fiber_TD})])
            .range([h, 0]);

        var xAxis = d3.axisBottom()
            .scale(x);

        var yAxis = d3.axisLeft()
            .scale(y);

        // x axis
        chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis)
            .append("text")
            .attr("x", w)
            .attr("y", -6);

        // x axis label
        chart.append("text")
            .attr("transform", "translate(" + (w / 2) + " ," + (h + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Protein (g)");

        // y axis
        chart.append("g")
            .attr("class", "axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em");

        // y axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Fiber (g)");

        drawVis(dataset);

    }).catch(
        function(reason) {
            console.log(reason);
        }
);

// set dimensions for chart space
var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("#visualization").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


//draw the circles initially and on each interaction with a control
function drawVis(dataset) {

    // Axes should not change in length when data is filtered.
    var x = d3.scaleLinear()
        .domain([0, maxProtein])
        .range([0, w]);

    var y = d3.scaleLinear()
        .domain([0, maxFiber])
        .range([h, 0]);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);


    // plot foods
    var circle = chart.selectAll("circle").data(dataset);

    circle
        .attr("cx", function(d) { return x(d.Protein);  })
        .attr("cy", function(d) { return y(d.Fiber_TD);  });

    circle.exit().remove();

    circle.enter().append("circle")
        .attr("cx", function(d) { return x(d.Protein);  })
        .attr("cy", function(d) { return y(d.Fiber_TD);  })
        .attr("r", 4)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity",.9);
            // display food name and protein/fiber content
            tooltip.html(d.Shrt_Desc + "Protein: " + d.Protein + "(g), Fiber:" + d.Fiber_TD + "(g)")
                .style("left",(d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("stroke", "black")
        .style("opacity", 0.5);
}

function filter(attr, values) {
    //  set range of changed attribute to the new values from the slider
    for (i = 0; i < attributes.length; i++) {
        if(attr === attributes[i]) {
            ranges[i] = values;
        }
    }
    var toVisualize = dataset.filter(function(d) {return isInRange(d)});
    drawVis(toVisualize);
}

// Fiber slider
$(function() {
    $("#fiberslider").slider({
        range: true,
        min: 0,
        max: maxFiber,
        values: [0, maxFiber],
        slide: function(event, ui) {
            $("#fiberamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Fiber_TD", ui.values);
        }
    });
    $("#fiberamount").val($("#fiberslider").slider("values",0) + " - " + $("#fiberslider").slider("values",1));
});

// Protein slider
$(function() {
    $("#proteinslider").slider({
        range: true,
        min: 0,
        max:maxProtein,
        values: [0, maxProtein],
        slide: function(event, ui) {
            $("#proteinamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Protein", ui.values);
        }
    });
    $("#proteinamount").val($("#proteinslider").slider("values",0) + " - " + $("#proteinslider").slider("values",1));
});

function isInRange(datum) {
    for (i = 0; i < attributes.length; i++) {
        if (datum[attributes[i]] < ranges[i][0] || datum[attributes[i]] > ranges[i][1]) {
            return false;
        }
    }
    return true;
}
