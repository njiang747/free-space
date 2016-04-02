Locations = new Mongo.Collection("locations");
Floors = new Mongo.Collection("floors");
Sensors = new Mongo.Collection("sensors");

if (Meteor.isClient) {

}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
