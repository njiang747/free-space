LocationList = new Mongo.Collection("locations");
FloorList = new Mongo.Collection("floors");
SensorList = new Mongo.Collection("sensors");

Router.route('/');

update = function() {
	var locCursor = LocationList.find({location: "Firestone Library"});
	var loc = locCursor.fetch();
	locCursor.forEach(function (loc) {
		var openNum = 0;
		var totalNum = 0;
		FloorList.find({location: loc.location}).
		forEach(function (floor) {
			openNum += floor.openNum;
			totalNum += floor.totalNum;
		});
		LocationList.update(loc._id, {
			$set: {openNum: openNum, totalNum: totalNum}
		});
	});
}

if (Meteor.isClient) {
	Session.setDefault('selectedLocation', 'Firestone Library');
	Session.setDefault('selectedFloor', 'Floor 1');

	setInterval(function() {
		update();
	}, 60000);

	Template.header.helpers({
		location: function() {
			var location = Session.get('selectedLocation');
			return LocationList.findOne({'location': location});
		}
	})
	
	Template.body.helpers({
		floors: function() {
			var location = Session.get('selectedLocation');
			return FloorList.find({location: location}, {sort: {level: -1}});
		},
		sensors: function() {
			var location = Session.get('selectedLocation');
			var floor = Session.get('selectedFloor');
			return SensorList.find({location: location, floor: floor});
		},
		map_image: function() {
			var floor = FloorList.findOne({'floor': Session.get('selectedFloor')});
			return floor.map;
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

	getImgName = function(sensorType) {
		if (sensorType == 1) return "light";
		else if (sensorType == 2) return "sound";
		else return "";
	}

	Template.marker.helpers({
		marker_image: function() {
			var imgNameBase = getImgName(this.sensortype);
			var on = this.status;
			if (on) return imgNameBase + "On.png";
			else return imgNameBase + "Off.png";
		},
		get_ypos: function() {
			if (this.sensortype == 2) return this.yPos + 1;
			else return this.yPos;
		}
	});

	// Update once every X minutes, update sensors -> floors -> location

	Template.addLocationForm.events({
		'submit .newLocation': function(event) {
			event.preventDefault();
			var locationName = event.target.locationName.value;
			var openNumLocation = event.target.openNumLocation.value;
			var totalNumLocation = event.target.totalNumLocation.value;
			LocationList.insert({
				location: locationName,
				openNum: parseInt(openNumLocation),
				totalNum: parseInt(totalNumLocation)
			})
			return false;
		},

		'submit .newFloor': function(event) {	
			var locationName = event.target.locationName.value;
			var floorName = event.target.floorName.value;
			var level = parseInt(event.target.level.value,10);
			var openNumFloor = parseInt(event.target.openNumFloor.value);
			var totalNumFloor = parseInt(event.target.totalNumFloor.value);
			var mapImage = event.target.mapImage.value;
			FloorList.insert({
				location: locationName,
				floor: floorName,
				level: level,
				openNum: openNumFloor,
				totalNum: totalNumFloor,
				map: mapImage
			})
			return false;
		},

		'submit .newSensor': function(event) {
			var locationName = event.target.locationName.value;
			var floorName = event.target.floorName.value;
			var sensorID = event.target.sensorID.value;
			var sensorType = event.target.sensorType.value;
			var sensorStatus = parseInt(event.target.sensorStatus.value);
			var lUsed = parseInt(event.target.lastUsed.value);
			var lChecked = parseInt(event.target.lastChecked.value);
			var xPosition = parseInt(event.target.xPosition.value);
			var yPosition = parseInt(event.target.yPosition.value);
			SensorList.insert({
				location: locationName,
				floor: floorName,
				sensor: sensorID,
				sensortype: sensorType,
				status: sensorStatus,
				lastUsed: lUsed,
				lastChecked: lChecked,
				xPos: xPosition,
				yPos: yPosition
			})
			return false;
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
  Router.map(function() {
	this.route('request', {
		where: 'server',
		action: function() {
			var id = this.request.body.id;
			var type = this.request.body.sensortype;
			var on = this.request.body.on;
			var lastC = (new Date()).now();
			if (on) SensorList.update({sensor: id}, {$set: {sensortype: type, status: on, lastUsed: lastC, lastChecked: lastC}});
			else SensorList.update({sensor: id}, {$set: {sensortype: type, status: on, lastChecked: lastC}});
			this.response.writeHead(200, {'Content-Type': 'text/html'});
			this.response.end('Successful Update\n');
			}
		})
	})

}
