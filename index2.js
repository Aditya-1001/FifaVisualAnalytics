var columnNames = [];
var categorical_features = ['International_Reputation','Body_Type','Attack_Work Rate','Defence Work Rate','Leg Work'];
var numerical_features = ['GDP','Rating','Value','Age','Weight','Height'];
var Wage = document.getElementById("Wage");
var slider = document.getElementById("myRange");
var select_list;
var nBin = 10;

var selected_option = d3.select(this).property('Value');
var feature_name;

  var dropdownChange = function() {
        var new_feature = d3.select(this).property('value');
      feature_name = new_feature;
        nBin = 10;
      slider.value = 10;

        if(categorical_features.includes(new_feature)){
            renderGraph(new_feature, DATA, "CATEGORICAL");
        } else {
            renderGraph(new_feature, DATA, "NUMERICAL", (16 - nBin) );
        }
        
        console.log("change "+ new_feature);    
    };

    var dropdown = d3.select("select")
                    .on("change", dropdownChange)
                    .attr("id", "select_list");

    dropdown.selectAll("option")
            .data(categorical_features.concat(numerical_features))
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; });


    dropdown.selectAll("option")
            .data(numerical_features)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; });

select_list = document.getElementById("select_list");

// Update the current slider value (each time you drag the slider handle)

//var feature_name = select_list.value;
var DATA;
const features_select = d3.select("#features_select");

d3.csv("fifa1.csv").then(function(data) {
  DATA = data;
  feature_name = select_list.value;
                         
                         
//  renderGraph('Wage', data, "NUMERICAL", nBin);

    if(categorical_features.includes(feature_name)){
             renderGraph(feature_name, DATA, "CATEGORICAL");
         } else {
             renderGraph(feature_name, DATA, "NUMERICAL",(16 - nBin));
    }
});



function Wage_ftr(){
    feature_name = "Wage";
    nBin=10;
    slider.value = 16 - nBin;
    renderGraph("Wage", DATA, "NUMERICAL", nBin);
};

function Region_ftr(){
  feature_name = "Region";
    renderGraph("Region",DATA, "CATEGORICAL");
};

function Skill_ftr(){
    feature_name = "Skill_Moves";
    renderGraph("Skill_Moves",DATA, "CATEGORICAL");
};

function Nationality_ftr(){
    feature_name = "Nationality";
    renderGraph("Nationality",DATA, "CATEGORICAL");
};

slider.oninput = function() {
  nBin = this.value;
    nBin = 16 - nBin;
  // renderGraph(feature_name, DATA, "NUMERICAL", nBin);
  update_histogram(feature_name, DATA, nBin);
}

function WhichButton(event){
    
  if(event.which == '1')
  {
      if(nBin<15)
      {
          nBin = nBin + 1;
          slider.value = 16 - nBin;
      }
      update_histogram(feature_name, DATA, nBin);
  }
    else if(event.which== '2')
    {
        if(nBin>1)
        {
        nBin = nBin - 1;
        slider.value = 16 - nBin;
        }
    }
    update_histogram(feature_name, DATA, nBin);

};

