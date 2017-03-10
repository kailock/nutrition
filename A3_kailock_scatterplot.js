/**
 * Created by kaitl on 2/18/2017.
 */

// Graphic margins and dimensions
var width = 900;
var height = 650;
var margin = {top: 20, right: 15, bottom: 30, left: 40};
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;

var dataset = [];
var attributes = ["Protein", "Carbohydrates", "Fiber", "Sugar", "Fat"];
var maxFiber = 79;
var maxProtein = 89;
var maxCarb = 78;
var maxSugar = 77;
var maxFat = 79;
var ranges = [[0, maxProtein], [0, maxFiber], [0, maxCarb], [0, maxSugar], [0, maxFat]];


// read in all data before drawing axes
var testPromise = new Promise(
    function(resolve, reject) {
        d3.csv("nutrients.csv", function(error, nutrients) {
            if(error) return console.warn(error);
            nutrients.forEach(function(d) {
                var datasetObject = {
                    Shrt_Desc : d["Shrt_Desc"],
                    Protein : +d["Protein"],
                    Fiber : +d["Fiber"],
                    Sugar: +d["Sugar"],
                    Fat: +d["Fat"],
                    Carbohydrates: +d["Carbohydrates"]
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

// Initially selected nutrients
var xNutrient = "Protein";
var yNutrient = "Fiber";

// Draw axes
testPromise.then(
    function() {
        var x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, w]);

        var y = d3.scaleLinear()
            .domain([0, 100])
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
            .style("text-anchor", "middle");

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
            .style("text-anchor", "middle");

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


// draw the circles initially and on each interaction with a control
function drawVis(dataset) {

    // Axes should not change in length when data is filtered.
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, w]);

    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([h, 0]);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);

    // plot foods
    var circle = chart.selectAll("circle").data(dataset);

    circle
        .attr("cx", function(d) { return x(d[xNutrient]);  })
        .attr("cy", function(d) { return y(d[yNutrient]);  });

    circle.exit().remove();

    circle.enter().append("circle")
        .attr("cx", function(d) { return x(d[xNutrient]);  })
        .attr("cy", function(d) { return y(d[yNutrient]);  })
        .attr("r", 4)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity",.9);
            // display food name and nutritional content
            tooltip.html('<b>' + d.Shrt_Desc + '</b><br />' + xNutrient + ": " + d[xNutrient] + "(g)" + '<br />' + yNutrient + ": " + d[yNutrient] + "(g)")
                .style("left",(d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            d3.select(this).attr("r", 10).style("fill", "#f6931f");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).attr("r", 4).style("fill", "black");
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


// Redraw graphic if different food is selected for x-axis
$(document.body).on('change',"#nutrientselect2",function (e) {
    xNutrient = $("#nutrientselect2 option:selected").text();
    console.log("x:" + xNutrient);
    var toVisualize = dataset.filter(function(d) {return isInRange(d)});
    drawVis(toVisualize);
});

// Redraw graphic if different food is selected for y-axis
$(document.body).on('change',"#nutrientselect1",function (e) {
    yNutrient = $("#nutrientselect1 option:selected").text();
    console.log("y:" + yNutrient);
    var toVisualize = dataset.filter(function(d) {return isInRange(d)});
    drawVis(toVisualize);
});


// All nutrition sliders

// Fiber slider
$(function() {
    $("#fiberslider").slider({
        range: true,
        min: 0,
        max: maxFiber,
        values: [0, maxFiber],
        slide: function(event, ui) {
            $("#fiberamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Fiber", ui.values);
        }
    });
    $("#fiberamount").val($("#fiberslider").slider("values",0) + " - " + $("#fiberslider").slider("values",1) + " grams");
});

// Protein slider
$(function() {
    $("#proteinslider").slider({
        range: true,
        min: 0,
        max: maxProtein,
        values: [0, maxProtein],
        slide: function(event, ui) {
            $("#proteinamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Protein", ui.values);
        }
    });
    $("#proteinamount").val($("#proteinslider").slider("values",0) + " - " + $("#proteinslider").slider("values",1) + " grams");
});

// Carbohydrate slider
$(function() {
    $("#carbslider").slider({
        range: true,
        min: 0,
        max: maxCarb,
        values: [0, maxCarb],
        slide: function(event, ui) {
            $("#carbamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Carbohydrates", ui.values);
        }
    });
    $("#carbamount").val($("#carbslider").slider("values",0) + " - " + $("#carbslider").slider("values",1) + " grams");
});

// Sugar slider
$(function() {
    $("#sugarslider").slider({
        range: true,
        min: 0,
        max: maxSugar,
        values: [0, maxSugar],
        slide: function(event, ui) {
            $("#sugaramount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Sugar", ui.values);
        }
    });
    $("#sugaramount").val($("#sugarslider").slider("values",0) + " - " + $("#sugarslider").slider("values",1) + " grams");
});

// Fat slider
$(function() {
    $("#fatslider").slider({
        range: true,
        min: 0,
        max: maxFat,
        values: [0, maxFat],
        slide: function(event, ui) {
            $("#fatamount").val(ui.values[0] + " - " + ui.values[1]);
            filter("Fat", ui.values);
        }
    });
    $("#fatamount").val($("#fatslider").slider("values",0) + " - " + $("#fatslider").slider("values",1) + " grams");
});

// Check that slider input is in range
function isInRange(datum) {
    for (i = 0; i < attributes.length; i++) {
        if (datum[attributes[i]] < ranges[i][0] || datum[attributes[i]] > ranges[i][1]) {
            return false;
        }
    }
    return true;
}