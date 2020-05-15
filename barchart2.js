 const margin = 60;
 const width = 1000 - 2 * margin;
 const height = 600 - 2 * margin;
 var x_label;
 var y_label;
 var bandwidth;
 var mapp;
 var max_val_x = 0;
 var max_val_y = 0;
 var xaxis_ticks;
 var yaxis_ticks;
 var yScale;
 var xScale;
 var xScale_copy;
 var hist_data;
 var x_values; 
 var x_values_copy; 
 var y_values;
 var xAxisGen;
 var axis_transition_time = 1000;

 function renderGraph(feature_name, data, type,nBin){

    if(type == "CATEGORICAL"){
        slider.style.visibility = "hidden";
        renderBarGraph(feature_name, data);
    } else {
        slider.style.visibility = "visible";
        renderHistogram(feature_name, data, nBin);
    }

 }

 function update_histogram(feature_name, data, nBin){
//      feature_name = 'Wage';
    var svg = d3.select("svg");
    
    load_data(feature_name, data);
    update_max_x();
   
    update_x_axis(feature_name, data, nBin , svg); 
    
    svg.select('#x-axis')
    .transition().duration(axis_transition_time)
    .call(xAxisGen);
   
    yaxis_ticks = svg.select('#y-axis');
    update_y_axis();

    update_rects();
 }

 
 function update_max_x(){
     max_val_x = d3.max(hist_data, function(d) { return d;} );
 }



 function showFeatureStats(feature_name, max_val, max_val_y){
    document.getElementById("x_feature").value = feature_name;
    document.getElementById("x-axis-max").value = max_val;
    document.getElementById("y-axis-max").value = max_val_y;
 }

 function load_data(feature_name, data){

    x_label = feature_name;
    y_label = "Category";
    hist_data = [];
    data.map(function(d) {
        hist_data.push(+d[feature_name]);
    })

 }

 function update_y_axis(){

    
    yScale = d3.scaleLinear();
    yScale.range([height, 0])
    .domain([0, max_val_y+100]);


    yaxis_ticks
    .transition().duration(axis_transition_time)
    .call(d3.axisLeft(yScale));
    

 }

 function update_x_axis(feature_name, data, nBin){
     max_val_y = 0;
     xScale = d3.scaleLinear()
    .range([0, width])
    .domain([0, max_val_x]);

    var xMap = scale_x(nBin, xScale.range(), xScale.domain());
    x_values = Object.keys(xMap);
    
    var x_freq_map = d3.nest()
                .key(function(d) { return d[feature_name]; })
                .sortKeys(d3.ascending)
                .rollup(function(leaves) { 
                    return leaves.length; 
                })
                .entries(data)

    y_values = {};
    x_freq_map = getValue(x_freq_map);

    for(i = 0;i<x_values.length;i++){
        count = 0;
        for(j = x_values[i]; j < parseInt(x_values[i]) + parseInt(bandwidth); j++){
            if(x_freq_map[parseInt(j)]!= undefined ){
                count += parseInt(x_freq_map[parseInt(j)]);
            }
        }

        if(j==max_val_x){
            if(x_freq_map[parseInt(j)]!= undefined){
                count += parseInt(x_freq_map[parseInt(j)]);
            }
        }
        y_values[x_values[i]] = count;
        if(count > max_val_y)
            max_val_y = count;
    }

    x_values_copy = x_values.slice();
    for(i=1;i<=3;i++){
        x_values_copy.push(parseInt(x_values_copy[x_values_copy.length - 1]) + parseInt(bandwidth));
    }
    
    xScale_copy = d3.scaleLinear()
    .range([0, width])
    .domain([0, max_val_x+ 2 * bandwidth]);
   

    x_values_copy.pop()
    xAxisGen = d3.axisBottom(xScale_copy);
    xAxisGen.ticks(nBin + 1);
    xAxisGen.tickValues(x_values_copy);
 }
 

 function getValue(x_freq_map){
    var map = {};
    for(i=0;i<Object.keys(x_freq_map).length; i++){
        map[parseInt(x_freq_map[i].key)] = parseInt(x_freq_map[i].value);
    }
    return map;
 }

 function update_rects(){
    
    var chart = d3.select('svg').select('g');
    mapp = [];
    for(i=0;i<x_values.length;i++){
        mapp[i] = {};
        mapp[i].key = x_values[i]; 
        mapp[i].value = y_values[x_values[i]];
    }

    var myColor = d3.scaleOrdinal()
        .domain(x_values)
        .range(d3.schemeSet2);

    var rectWidth;
    if(nBin == 1)
        rectWidth = Math.ceil(xScale_copy(max_val_x));
     else 
        rectWidth = Math.ceil(xScale_copy(x_values[1]));

    var rectX = {};
    var nextVal = 0;
    for(i=0;i<x_values.length;i++){
        rectX[x_values[i]] = nextVal;
        nextVal += rectWidth;
    }

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {      
        return "<span style='color:red'>" + d.value + "</span>";
    })

    
    chart.call(tip);

    d3.selectAll("rect").remove();
    chart.selectAll()
            .data(mapp)
            .enter()
            .append('rect')
            .attr('x', (s) => xScale_copy(s.key))
            .attr('y', (s) => height)
            .attr('height', 0)
            .attr("opacity", 0.8)
            .attr('width', rectWidth)
            .attr("fill", (s) => myColor(s.key))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('mouseenter', function (s, i) {
                d3.select(this).raise();

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('width', rectWidth + 10)
                    .attr('height', (s) => height - yScale(s.value) + 10)
                    .style("transform", "scale(1,0.979)"); // Doubt scaling here for y?
                
            })
            .on('mouseleave', function (actual, i) {
                d3.select(this)
                .attr("opacity", 0.6)
                .transition()
                .duration(200)
                .attr('width',rectWidth)
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)");

            
            })

    const t = d3.transition()
      .duration(axis_transition_time);

    chart.selectAll('rect')
    .transition(t)
    .attr('height', (s) => height - yScale(s.value))
    .attr('y', (s) => yScale(s.value));
 }

 function renderHistogram(feature_name, data, nBin){
        // Clear graph
     d3.selectAll("svg").remove();

    var svg = d3.select("#visual_area").append("svg")
    .attr("width", 1000)
    .attr("height", 900)
     .attr("margin-left", 500)
     .attr("margin-top",300);
    
    var chart = svg.append('g')
    .attr('transform',`translate(${margin}, ${margin})`);
    
    load_data(feature_name, data);
    update_max_x();
   
    update_x_axis(feature_name, data, nBin , svg); 
    
    chart.append('g')
    .attr('id','x-axis')
    .attr('transform', `translate(0, ${height})`)
    .transition().duration(axis_transition_time)
    .call(xAxisGen);
    
   

    yaxis_ticks = chart.append('g').attr('id','y-axis');
    update_y_axis();

    
  
   
    var myColor = d3.scaleOrdinal()
       .domain(data.map((s) => s.key))
       .range(d3.schemeSet2);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {      
        return "<span style='color:"+ myColor(d.key)+"'>" + d.value + "</span>";
      })

    
    svg.call(tip);

   
    mapp = [];
    for(i=0;i<x_values.length;i++){
        mapp[i] = {};
        mapp[i].key = x_values[i]; 
        mapp[i].value = y_values[x_values[i]];
    }

    var rectWidth;
    if(nBin == 1)
        rectWidth = Math.ceil(xScale_copy(max_val_x));
     else 
        rectWidth = Math.ceil(xScale_copy(x_values[1]));

    var rectX = {};
    var nextVal = 0;
    for(i=0;i<x_values.length;i++){
        rectX[x_values[i]] = nextVal;
        nextVal += rectWidth;
    }

     // title
    svg.append('text')
    .attr('x', width / 2 + margin)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .text('Visual Analytics of '+ y_label + ' ' + x_label)

    var bars = chart.selectAll()
            .data(mapp)
            .enter()
            .append('rect')
            .attr('x', (s) => xScale_copy(s.key))
            .attr('y', (s) => height)
            .attr("opacity", 0.8)
            .attr('width', rectWidth)
            .attr('height',  0)
            .attr("fill", (s) => myColor(s.key))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('mouseenter', function (s, i) {
                d3.select(this).raise();

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('width', rectWidth+ 10)
                    .attr('height', (s) => height - yScale(s.value) + 10)
                    .style("transform", "scale(1,0.979)"); // Doubt scaling here for y?
              
            })
            .on('mouseleave', function (actual, i) {
                d3.select(this)
                .attr("opacity", 0.8)
                .transition()
                .duration(200)
                .attr('width',rectWidth)
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)");

          

            })

    const t = d3.transition()
      .duration(750);

    chart.selectAll('rect')
    .transition(t)
    .attr('height', (s) => height - yScale(s.value))
    .attr('y', (s) => yScale(s.value));
           
       // x-axis label
    svg.append('text')
    .attr('y', (height) + 1.5 * margin)
    .attr('x', width / 2 + margin)
    .attr('text-anchor', 'middle')
    .text(x_label);

    // y-axis label
    svg.append('text')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Frequency')

 }


 function scale_x(nBin, range, domain){
    var phy_unit = Math.ceil(range[1] / domain[1]);
    bandwidth = Math.ceil(domain[1] / nBin);

    var xMap = {};
    for(i=domain[0];i<domain[1];i+=bandwidth){
        xMap[parseInt(i)] = phy_unit*parseInt(i);
    }   
  
    return xMap;

 }

 function renderBarGraph(feature_name, data){

    // Clear graph
    d3.selectAll("svg").remove();

    const x_label = feature_name;
    const y_label = "Category";

    const width = 800;
    const height = 600 - 2 * margin;


    // Getting counts for unique values of features
    var sample = d3.nest()
                .key(function(d) { return d[feature_name]; })
                .sortKeys(d3.ascending)
                .rollup(function(leaves) { return leaves.length; })
                .entries(data)

    var max_val = d3.max(sample, function(d) { return d.value;} );

    // const svg = d3.select('#main_bar_svg');
    // const chart = svg.append('g')
    // .attr('transform', `translate(${margin}, ${margin})`);


    var svg = d3.select("#visual_area").append("svg")
    .attr("width", 1000)
    .attr("height", 900)
    .attr("margin-left", 500)
    .attr("margin-top",500)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")"); 

     // Graph render
  

    var myColor = d3.scaleOrdinal()
       .domain(sample.map((s) => s.key))
       .range(d3.schemeSet2);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {      
        return "<span style='color:"+ myColor(d.key)+"'>" + d.value + "</span>";
      })

    svg.call(tip);

    const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, max_val+100]);


    svg.append('g')
    .call(d3.axisLeft(yScale));

    const xScale = d3.scaleBand()
    .range([0, width])
    .domain(sample.map((s) => s.key))
    .padding(0.2)




    svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style("text-anchor", "end")
    .attr("dx", "-1em")
    .attr("dy", "-.3em")
    .attr("transform", "rotate(-65)");


        var bars = svg.selectAll()
            .data(sample)
            .enter()
            .append('rect')
            .attr('x', (s) => xScale(s.key))
            .attr('y', (s) => yScale(s.value))
            .attr('height', (s) => height - yScale(s.value))
            .attr('width', xScale.bandwidth())
            .attr("fill", (s) => myColor(s.key))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('mouseenter', function (s, i) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .text('xx')
                    .attr('opacity', 0.6)
                    .attr('x', (a) => xScale(a.key) - 5)
                    .attr('width', xScale.bandwidth() + 10)
                    .attr('height', (s) => height - yScale(s.value) + 10)
                    .style("transform", "scale(1,0.979)") // Doubt scaling here for y?
            })
            .on('mouseleave', function (actual, i) {
                d3.select(this)
                .attr("opacity", 1)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('x', (a) => xScale(a.key))
                .attr('width', xScale.bandwidth())
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)")
            })

                          const t = d3.transition()
                            .duration(750);

                          bars.selectAll('rect')
                          .transition(t)
                          .attr('height', (s) => height - yScale(s.value))
                          .attr('y', (s) => yScale(s.value));
    // Labels on axis
    // y-axis
    svg.append('text')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Frequency')

    // title
    svg.append('text')
    .attr('x', width / 2 + margin)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .text('Visual Analytics of '+ y_label + ' ' + x_label)

    // x-axis
    svg.append('text')
    .attr('y', (height) + 1.5 * margin)
    .attr('x', width / 2 + margin)
    .attr('text-anchor', 'middle')
    .text(x_label)

    
    
}
