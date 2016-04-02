SensorList = new Mongo.Collection("sensors");
LocationList = new Mongo.Collection("locations");
FloorList = new Mongo.Collection("floors");

if (Meteor.isClient) {
	Session.setDefault('selectedLocation', 'Firestone Library');
	Session.setDefault('selectedFloor', 'Floor 1');

	Template.header.helpers({
		location: function() {
			var location = Session.get('selectedLocation');
			return LocationList.findOne({"library": location});
		}
	})
	
	Template.body.helpers({
		floors: function() {
			var location = Session.get('selectedLocation');
			return FloorList.find({location: location}, {sort: {floor: -1}});
		}
	})

	Template.body.events({
		'click .map': function(event) {
			console.log("(" + event.clientX + "," + event.clientY + ")");
		}
	});
	
	Template.tab.helpers({		
		selected_floor: function() {
			var floor_name = this.floor;
			var selectedFloor = Session.get('selectedFloor');
			if (floor_name == selectedFloor) return "selected";
			else return "unselected";
		}
	});

	Template.tab.events({
		'click': function(event) {
			var floor_name = this.floor;
			Session.set('selectedFloor', floor_name);
		}
	})

	Template.addLocationForm.events({
		'submit .newLocation': function(event) {
			event.preventDefault();
			var locationName = event.target.locationName.value;
			var openNumLocation = event.target.openNumLocation.value;
			var totalNumLocation = event.target.totalNumLocation.value;
			LocationList.insert({
				location: locationName,
				openNum: openNumLocation,
				totalNum: totalNumLocation
			})
			return false;
		},

		'submit .newFloor': function(event) {	
			var locationName = event.target.locationName.value;
			var floorName = event.target.floorName.value;
			var openNumFloor = event.target.openNumFloor.value;
			var totalNumFloor = event.target.totalNumFloor.value;
			var mapImage = event.target.mapImage.value;
			FloorList.insert({
				location: locationName,
				floor: floorName,
				openNum: openNumFloor,
				totalNum: totalNumFloor,
				map: mapImage
			})
			return false;
		},

		'submit .newSensor': function(event) {
			var locationName = event.target.locationName.value;
			var floorName = event.target.floorName.value;
			var sensorName = event.target.sensorName.value;
			var sensorStatus = event.target.sensorStatus.value;
			var lUsed = event.target.lastUsed.value;
			var lChecked = event.target.lastChecked.value;
			var xPosition = event.target.xPosition.value;
			var yPosition = event.target.yPosition.value;
			var markerImage = event.target.markerImage.value;
			SensorList.insert({
				location: locationName,
				floor: floorName,
				sensor: sensorName,
				status: sensorStatus,
				lastUsed: lUsed,
				lastChecked: lChecked,
				xPos: xPosition,
				yPos: yPosition,
				image: markerImage
			})
			return false;
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
