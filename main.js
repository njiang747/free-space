SensorList = new Mongo.Collection("sensors");
LocationList = new Mongo.Collection("locations");
FloorList = new Mongo.Collection("floors");

if (Meteor.isClient) {

	Template.body.events({
		'click .map': function(event) {
			console.log("(" + event.clientX + "," + event.clientY + ")");
		}
	});
	
	Template.tab.events({
		'click .tabs': function(event) {
			console.log("hi");
		}
	})

	Template.addLibraryForm.events({

		

		'submit .newLibrary': function(event) {
			event.preventDefault();
			var libraryName = event.target.libraryName.value;
			var openNumLibrary = event.target.openNumLibrary.value;
			var totalNumLibrary = event.target.totalNumLibrary.value;
			LocationList.insert({
				library: libraryName,
				openNum: openNumLibrary,
				totalNum: totalNumLibrary
			})
		},

		'submit .newFloor': function(event) {	
			var libraryName = event.target.libraryName.value;
			var floorName = event.target.floorName.value;
			var openNumFloor = event.target.openNumFloor.value;
			var totalNumFloor = event.target.totalNumFloor.value;
			var mapImage = event.target.mapImage.value;
			FloorList.insert({
				library: libraryName,
				floorName: floorName,
				openNum: openNumFloor,
				totalNum: totalNumFloor,
				map: mapImage
			})
		},

		'submit .newSensor': function(event) {
			var libraryName = event.target.libraryName.value;
			var floorName = event.target.floorName.value;
			var sensorName = event.target.sensorName.value;
			var sensorStatus = event.target.sensorStatus.value;
			var lUsed = event.target.lastUsed.value;
			var lChecked = event.target.lastChecked.value;
			var xPosition = event.target.xPosition.value;
			var yPosition = event.target.yPosition.value;
			var markerImage = event.target.markerImage.value;
			SensorList.insert({
				library: libraryName,
				floorName: floorName,
				sensor: sensorName,
				status: sensorStatus,
				lastUsed: lUsed,
				lastChecked: lChecked,
				xPos: xPosition,
				yPos: yPosition,
				image: markerImage
			})
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
