
//Jquery
//@prepros-prepend jquery-1-10-2.min.js

//Slidebars
//@prepros-prepend ../plugins/slidebars/slidebars.js

//Knockout
//@prepros-prepend knockout-3.3.0.js

//Utils
//@prepros-prepend utils.js




//Initializes the module
var init = function(storedLocations){

	/*Generates the Location object*/
	var Location = function(data, index){
		this.title = data.title;
		this.latLng = new google.maps.LatLng(data.latLng[0].lat,data.latLng[0].lng);
		this.images = data.images;
		this.visible = true;
		this.activated = ko.observable(false);
		this.index = index;
	}

	var ViewModel = function() {
		var self = this;

		//Hides the loading wheel
		this.hideLoading = ko.observable(true);

		/*Sets the Error message in false to hide it*/
		this.showError = ko.observable(false);

		/*Checks the 'storedLocations' received in the init function
		if the data is empty then shows the error message*/
		if(storedLocations.length < 1){
			self.showError(true);
		}

		//Creates a new observable array for locations
		this.locationsList = ko.observableArray([]);
		
		/*Pushes all locations into the observable array, from the 
		storedLocations parameter, and also sends the index*/
		for (var i = 0; i < storedLocations.length; i++) {
			self.locationsList.push(new Location(storedLocations[i], i));
		}
		
		/*Activates current selection in the list by the object's index*/
		this.activateMe = function(me){
			var index = me.index;
			self.setActiveMarker(self.markerList()[index]);
			self.setActiveLocation(self.locationsList()[index]);
			self.showInfoWindow(index);
		}

		//The input filter value
		this.filterTxt = ko.observable();

		/*Filters the locations list*/
		this.filterLocation = ko.computed(function () {
			if (self.filterTxt() !=undefined) {
				return this.locationsList().filter(function (location) {
					return location.title.toLowerCase().match(self.filterTxt().toLowerCase());
				});
			} else {
				return this.locationsList();				
			}
		}.bind(this));


		/*Map Configuration*/
		this.centerPos = new google.maps.LatLng(41.9034907968206, 12.45351791381836);
		this.mapCanvas = document.getElementById('map-canvas');
		this.mapOptions = {
		  zoom: 16,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		this.map = new google.maps.Map(self.mapCanvas, self.mapOptions);
		this.map.setCenter(this.centerPos);

		/*Creating observables for markers and info windows lists*/
		this.markerList = ko.observableArray([]);
		this.infoWindowList = ko.observableArray([]);

		/*Generates the Markers in the map and the InfoWIndows*/
		this.locationsList().forEach(function(location, index){
			marker = new google.maps.Marker({
				map: self.map,
				position: location.latLng,
				title : location.title,
				images: location.images,
				animation: google.maps.Animation.DROP,
				index: index
			});
			marker.addListener('click', function() {
				self.activateMe(this);
			});
			self.markerList.push(marker);

			/*Creates an empty 'imgs' var to store 
			the images from the marker*/
			var imgs = '';

			//log(marker.images)
			//Itearates marker images to get the url and prepare the markup
			for (i = 0; i< marker.images.images.length; i++){
				imgs += '<a target="_blank" href="'+marker.images.links[i]+'"><img class="marker-image" src="'+marker.images.images[i]+'"></a>';
			}

			//Adds infowindow content
			var infoContent = '<strong>'+marker.title+'<strong><br>'+imgs;

			//Generates infowindow onbecj and sets the content
			var infowindow = new google.maps.InfoWindow({
			    content: infoContent
			})

			//Pushes the infowindow into its 'infoWindowList' array
			self.infoWindowList.push(infowindow);
		});

		//Activates the current location
		this.setActiveLocation = function(locate){
			this.locationsList().forEach(function(location){
				location.activated(false);
			})
			locate.activated(true);
		}

		//Animates the activated Marker
		this.setActiveMarker = function(marker){
			self.markerList().forEach(function(marker){
				marker.setAnimation(null);
			})
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}

		//Opens the info window depending on the index
		this.showInfoWindow = function(index){
			self.infoWindowList().forEach(function(info){
				info.close();
			});
			self.infoWindowList()[index].open(self.map, self.markerList()[index]);
		}

		//FIlters the Markers depending on the filter text
		this.filterMarkers = function() {
			log('fileterrr');
			if (self.filterTxt() !=undefined) {
				this.markerList().forEach(function(marker){
					if(marker.title.toLowerCase().match(self.filterTxt().toLowerCase())){
						marker.setVisible(true);
					}else{
						marker.setVisible(false);
					}
				})
			} else {
				this.markerList().forEach(function(marker){
					marker.setVisible(true);
				})
			}
		};
	}

	ko.applyBindings(new ViewModel(), document.getElementById('body'));
}