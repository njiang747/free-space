LocationList = new Mongo.Collection("locations");
FloorList = new Mongo.Collection("floors");
SensorList = new Mongo.Collection("sensors");

Router.route('/');

update = function() {
	FloorList.find().forEach(function (floor) {
		var openNum = 0;
		var totalNum = 0;
		SensorList.find({location: floor.location, floor: floor.floor}).
		forEach(function (sensor) {
			openNum += sensor.status;
			totalNum += 1;
		});
		FloorList.update(floor._id, {
			$set: {openNum: openNum, totalNum: totalNum}
		});
	});
	LocationList.find().forEach(function (loc) {
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
	Session.setDefault('selectedMarker', '236a5a068fb7bdee')

	setInterval(function() {
		update();
	}, 5000);

	Template.header.helpers({
		location: function() {
			var location = Session.get('selectedLocation');
			return LocationList.findOne({location: location});
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
		},
		'mouseover .marker-image': function(event) {
			Session.set('selectedMarker', this.sensor);
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
			if (this.sensortype == 2) return this.yPos + 0.7;
			else return this.yPos;
		}
	});

	msToMinutes = function(ms) {
		console.log(ms);
		return Math.round(ms/1000/60);
	}

	Template.statsTemp.helpers({
		sensor_type: function() {
			var id = Session.get('selectedMarker');
			var cur = SensorList.findOne({sensor: id});
			return cur.sensortype;
		},
		status: function() {
			var id = Session.get('selectedMarker');
			var cur = SensorList.findOne({sensor: id});
			if (cur.status) return "In-Use";
			else return "Open";
		},
		last_used: function() {
			var id = Session.get('selectedMarker');
			var cur = SensorList.findOne({sensor: id});
			if (cur.status) return 0;
			if (cur.lastUsed < 1000) return cur.lastUsed;
			return msToMinutes(Date.now()-cur.lastUsed);
		},
		last_checked: function() {
			var id = Session.get('selectedMarker');
			var cur = SensorList.findOne({sensor: id});
			if (cur.lastChecked < 1000) return cur.lastChecked;
			return msToMinutes(Date.now()-cur.lastChecked);
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
			var xPosition = parseFloat(event.target.xPosition.value);
			var yPosition = parseFloat(event.target.yPosition.value);
			console.log(sensorID);
			var exists = SensorList.findOne({'sensor': sensorID});
			console.log(exists);
			if (exists) {
				SensorList.update(exists._id, {$set:{
					location: locationName,
					floor: floorName,
					sensor: sensorID,
					sensortype: sensorType,
					status: sensorStatus,
					lastUsed: lUsed,
					lastChecked: lChecked,
					xPos: xPosition,
					yPos: yPosition
				}});
			}
			else {
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
				});
			}
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
			var lastC = Date.now();
			SensorList.update({sensor: id}, {$set: {sensortype: type, status: on}});
			if (on) SensorList.update({sensor: id}, {$set: {sensortype: type, status: on, lastUsed: lastC, lastChecked: lastC}});
			else SensorList.update({sensor: id}, {$set: {sensortype: type, status: on, lastChecked: lastC}});
			update();
			this.response.writeHead(200, {'Content-Type': 'text/html'});
			this.response.end('Successful Update\n');
			}
		})
	})

}
