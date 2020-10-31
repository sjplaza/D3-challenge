
let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let chosenX = "poverty";
let chosenY = "healthcare";

function xScale(data, chosenX) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenX]) * 0.7,
        d3.max(data, d => d[chosenX]) * 1.3])
        .range([0, width]);

    return xLinearScale;
};

function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

function renderCircles(circlesGroup, newXScale, chosenX) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]));

    return circlesGroup;
};

function updateToolTip(chosenX, circlesGroup) {
    let label;
    if (chosenX === "poverty") {
        label = "Poverty (%)"
    }
    else {
        label = "Healthcare (%)";
    }

    let toolTip = d3.tip()
        .attr("class", "toolTip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.abbr}<br>${label} ${d[chosenX]}`)
        });

    circlesGroup.call(toopTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        .on("mouseout", function (data) {
            toolTip.hide(data)
        });

    return circlesGroup;
};

// load data from csv file
d3.csv("./data.csv").then(function (data) {
    // console.log(data)
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income
    });

    let xLinearScale = xScale(data, chosenX);

    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenX]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", "0.5");

    // create x-axis labels
    let xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    let ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (median)");

    let incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income (median)");

    // create y0axis labels
    let ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Healthcare vs. Poverty");

    let healthcareLabel = ylabelsGroup.append("text")
        .attr("x", -(height / 2))
        .attr("y", -20)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Healthcare");

    let smokesLabel = ylabelsGroup.append("text")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    let obesityLabel = ylabelsGroup.append("text")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip
    circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

    labelsGroup.selectAll("text")
        .on("click", function () {

            let value = d3.select(this).attr("value");
            if (value === chosenX) {

                chosenXAxis = value;
                console.log(chosenX);

                xLinearScale = xScale(data, chosenX);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenX);
                circlesGroup = updateToolTip(chosenX, circlesGroup);

                if (chosenX === "age") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else if (chosenX === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })
});
    // .catch(function (error) {
    // console.log(error)
