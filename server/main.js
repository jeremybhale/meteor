Meteor.publish('discoveries', function(id){
	return DiscoveryList.find({ _id: id });
});

Meteor.publish('time', function(id){
	return TimeList.find({ _id: id });
});

Meteor.publish('puzzles', function(id){
	return PuzzleList.find({ _id: id });
});

Meteor.publish('admin_discoveries', function(){
	return DiscoveryList.find();
});

Meteor.publish('admin_time', function(){
	return TimeList.find();
});

Meteor.publish('admin_puzzles', function(){
	return PuzzleList.find();
});

Meteor.publish('admin_achievements', function(){
	return AchievementList.find();
});

Meteor.publish('user_game_info', function(){
	return Meteor.users.find({_id: this.userId}, {fields: {'gameInfo': 1}});
});