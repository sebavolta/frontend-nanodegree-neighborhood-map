//Just a log function
var log = function(logMe) {
	console.log(logMe);
}

$('document').ready(function(){
	ready();
})

//Ready function Is called when document is loaded
var ready = function() {
	//Initializes slider
	var mySlidebars = new $.slidebars();

	//Stops propagations
	function eventHandler(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	
	// Toggles the left menu
	$('.toggle-left').on('click', function(e) {
		eventHandler(e);
		mySlidebars.slidebars.toggle('left');
	});

	/*Get the json data*/
	$.getJSON("data/locations.json", function(data) { 
		mainData(data);
	})
	.done(function() {
		log( "second success" );
	})
	.fail(function() {
		log( "error loading local json" );
	})
	.always(function() {
		log( "complete" );
	});
}

//Arrays for storing data
var storedLocations = [];
var ajaxResult = [];

//Stores the main url data form the local.json file
var mainData = function(data){
	for(i in data['locations']){
		storedLocations.push(data['locations'][i]);
	}
	runStoredUrl(0);
}

/*Iterates saved urls and calls ajax to obtain external json info.
It starts with the '0' item received from the index
*/
var runStoredUrl = function(index){
	if(index < storedLocations.length){
		callAjax(storedLocations[index].url, index);
	}
}

/*Calls ajax to obtain flickr json info. When the info is completely loaded,
it calls the 'runStoredUrl' function again increasing the index*/
var callAjax = function(url,index) {
	
	/*Get the json data*/
	$.getJSON(url, function(data) { 
		//    
	})
	.done(function(data) {
		log( "second success" );
		externalData(data);
		runStoredUrl(index + 1);
	})
	.fail(function() {
		log( "error loading flickr" );
		sendEmpty();
	})
	.always(function() {
		log( "complete" );
	});
}

//Stores the external url info
var externalData = function(data){
	ajaxResult.push(data);

	/*Checks the data to be the same amount in both arrays 
	and calls the mixData function*/
	if(ajaxResult.length == storedLocations.length){
		mixData();
	}
}

/*Mix local and externl Data, into a 'storedLocations' array by 
setting the 'images' values on each location's data*/
var mixData = function(){
	storedLocations.forEach(function(location, i){
		var myImages = {
			images: [],
			links: []
		};
			/*Iterates 3 images from flick in the 'ajaxResult' array 
			and set them into 'myImages' object with their link*/
			for(j = 0; j < 3; j++) {
				myImages.images.push(ajaxResult[i].items[j].media.m);
				myImages.links.push(ajaxResult[i].items[j].link);
			}
			
		//Sets the array of images into the location object
		location.images = myImages;

		/*When all data is completed, lets call the 'init' function 
		to start working on the Model*/
		if(i == storedLocations.length - 1){
			//log('ready to run')
			init(storedLocations);
		}
	});
}

/*Sends an empy array to the init function 
to show the error message. This happens
in case of an error in the ajax loading*/
var sendEmpty = function() {
	init(new Array());
}