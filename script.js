$(document).ready(function () {
    
// This is our API key. Add your own API key between the ""
var APIKey = "166a433c57516f51dfab1f7edaed8413";

// returns a date string, input parameter adds the number of days to today's date.
function dateString (day) {
    var today = new Date();
    var dd = String(today.getDate() + day);
    var mm = String(today.getMonth() + 1);
    var yyyy = today.getFullYear();
    return(mm + "/" + dd + "/" + yyyy);
}

// adds elements dynamically
$("#today").append('<div class="card-body">');
$(".card-body").append('<h3 id="city-name" class="city-name align-middle"></h3>');
$(".card-body").append('<img id="current-pic" src="" alt="" title="">');
$(".card-body").append('<p id="temperature"></p>');
$(".card-body").append('<p id="humidity"></p>');
$(".card-body").append('<p id="wind-speed"></p>');
$(".card-body").append('<p id="UV-index"></p>');
$("#forecast").hide();
$("#forecast").append('<div class="col-12">');
$(".col-12").append('<h3 id="forecast_title"></h3>');
for (x=1; x<=5; x++) {
    $("#forecast").append('<div id="day' + x + '" class="col-md-2 forecast bg-primary text-white m-2 rounded"></div>');
    $("#day" + x).append('<p id="date' + x + '" class="mt-3 mb-0 forecast-date"></p>');
    $("#day" + x).append('<img id="image' + x + '" src="" alt="" title="">');
    $("#day" + x).append('<p id="temp' + x + '"></p>');
    $("#day" + x).append('<p id="humidity' + x + '"></p>');
}

// Read history from local storage
var history = [];
var json_history = JSON.parse(localStorage.getItem("history"));
$("#history").append('<button class="btn btn-primary mb-3" type="button" id="clear-history">Clear history</button>');
for(var i in json_history) {   
    history.push(json_history[i]);
    $("#history").append('<button class="btn btn-light" type="button" id="history' + i + '" value="' + json_history[i] + '">' + json_history[i] + '</input>');  
}
 
// transfer history to search input when clicked
$("button").on('click', function(event){
    if (event.target.id != "search-button") {
        $("#search-value").attr("value",event.target.value); 
    }
});

// Clear history data
$("#clear-history").on("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("history")
    location.reload();
})

// Create CODE HERE to calculate the temperature (converted from Kelvin)
function K_to_F(kelvin){
    var fahrenheit = (kelvin - 273.15) * 9/5 + 32;
    return (fahrenheit);
}

// Search by City
$("#search-button").on("click", function(e) {
    e.preventDefault();
    console.log(e.target.id);
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + $(this).siblings("#search-value").val() + "&appid=" + APIKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
      console.log (response);

    // Dynamically populate today's weather
    $("#city-name").html(response.name + " (" + dateString(0) + ")");
    $("#wind-speed").html("Wind Speed: " + response.wind.speed + " MPH");
    $("#humidity").html("Humidity: " + response.main.humidity + "%");
    $("#temperature").html("Temperature: " + Math.round(K_to_F(response.main.temp)) + " &#176F");  
    $("#current-pic").attr("src","https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png");
    $("#current-pic").attr("alt",response.weather[0].description);
    $("#current-pic").attr("title",response.weather[0].description);
    
    // Add city to local storage if it doesn't exist in the history
    var cityExists = false;
    for (x=0; x<history.length; x++) {
        if (response.name===history[x]) {cityExists = true}
    }
    if (cityExists===false) {
    history.push(response.name);
    localStorage.setItem("history", JSON.stringify(history));
    }

    // Get UV Index and 5 Day Forecast based on geocode from first query
        var UVqueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + APIKey;
        $.ajax({
            url: UVqueryURL,
            method: "GET"
        }).then(function(response) {
            // Add UV Index
            $("#UV-index").html('UV Index: <span title= "" class="" id="UV_index_span"></span>');
            $("#UV_index_span").html(response.current.uvi); 
            
            // UV Index rating scale from https://www.epa.gov/sunsafety/uv-index-scale-0
            if (Math.round(response.current.uvi) < 3 ) {
            $("#UV_index_span").attr("class", "badge badge-success");
            $("#UV_index_span").attr("title", "favorable");
            }
            else if (Math.round(response.current.uvi)< 8) {
                $("#UV_index_span").attr("class", "badge badge-warning");
                $("#UV_index_span").attr("title", "moderate");
            }
            else {
                $("#UV_index_span").attr("class", "badge badge-danger");
                $("#UV_index_span").attr("title", "severe");
            }  
            
            // Add 5 Day Forecast
            $("#forecast").show();
            $("#forecast_title").html("5-Day Forecast");
            for (x=1; x<=5; x++) {
        //        $("#day" + x).append('<div id="day' + x + '" class="col-md-2 forecast bg-primary text-white m-2 rounded"></div>');
                $("#date" + x).html(dateString(x));
                $("#image" + x).attr("src","https://openweathermap.org/img/wn/" + response.daily[x].weather[0].icon + "@2x.png");
                $("#image" + x).attr("alt",response.daily[x].weather[0].description);
                $("#image" + x).attr("title",response.daily[x].weather[0].description);
                $("#temp" + x).html("Temp: " + Math.round(K_to_F(response.daily[x].temp.max)) + " &#176F");
                $("#humidity" + x).html("Humidity: " + response.daily[x].humidity + "%");
            }
        });
    });
})



})
