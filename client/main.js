Router.route('/', {
	name: 'home',
	template: 'main',
	onBeforeAction: function(){
		if(Meteor.user()){
			this.next();
		} else {
			this.render('login');
		}
	},
	waitOn: function(){
        return Meteor.subscribe('user_game_info', Meteor.userId());
    }
});

Router.route('/create_player', function () {
  this.render('create_player');
});

Router.route('/scan', {
	name: 'scan',
	onBeforeAction: function() {
		import '../public/scripts/scan.js';
		this.next();
	},
});

Router.route('/create_achievement', function () {
  this.render('create_achievement');
});

Router.route('/create_time', function () {
  this.render('create_time');
});

Router.route('/create_discovery', function () {
  this.render('create_discovery');
});

Router.route('/create_puzzle', function () {
  this.render('create_puzzle');
});

Router.route('/register', function () {
  this.render('register');
});

Router.route('/login', function () {
  this.render('login');
});

Router.route('/logout', function () {
	this.render('logout');
});

Router.route('/:_id', {
	name: 'scannedItem',
	template: 'login',
	data: function(){
		var id = this.params._id;
		return DiscoveryList.find({ _id: id });
	},
	onBeforeAction: function(){
		var id = this.params._id;
		var discovery = DiscoveryList.find({ _id: id }).count();
		var puzzles = PuzzleList.find({ _id: id }).count();
		var time = TimeList.find({ _id: id }).count();
		if(Meteor.user() && discovery > 0){
			this.render("discovery");
		} else if(Meteor.user() && puzzles > 0){
			this.render("puzzle");
		} else if(Meteor.user() && time > 0){
			this.render("time");
		} else if(Meteor.user()){
			this.render("fourohfour");
		} else{
			this.next();
		}
	},
	waitOn: function(){
		var id = this.params._id;
		return [ Meteor.subscribe('user_game_info', Meteor.userId()), Meteor.subscribe('discoveries', id), Meteor.subscribe('puzzles', id), Meteor.subscribe('time', id), Meteor.subscribe('admin_achievements', id)];
	},
});

Template.header.helpers({
	'user': function(){ 
		//Meteor.call('initializeUser', Meteor.userId());
		return Meteor.user();
	},
});

Template.rewards.created = function(){
	this.subscribe('user_game_info', Meteor.userId());
	this.subscribe('admin_achievements');
}

Template.rewards.helpers({
	'firstTime': function(){
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		
		if(DiscoveryList.findOne() && DiscoveryList.findOne().type == "sand"){
			var info = DiscoveryList.findOne();
			return player.eggs.includes(info._id);
		} else if(DiscoveryList.findOne() && DiscoveryList.findOne().type == "delivery"){
			var info = DiscoveryList.findOne();
			return player.deliveries.includes(info._id);
		} else if(DiscoveryList.findOne()){
			var info = DiscoveryList.findOne();
		} else if(PuzzleList.findOne()){
			var info = PuzzleList.findOne();
		}  else {
			var info = TimeList.findOne();
		}
		
		return player.story.includes(info._id);
	},
	'achExists': function(id){
		if(DiscoveryList.findOne() && DiscoveryList.findOne().type != "informational"){
			return false;
		}
		return AchievementList.findOne({_id: id});
	},
	'xpExists': function(xp){
		console.log(xp);
		if(xp && parseInt(xp) > 0){
			return true;
		}
		return false;
	},
	'info': function(){
		if(DiscoveryList.findOne()){
			var info = DiscoveryList.findOne();
		} else if(PuzzleList.findOne()) {
			var info = PuzzleList.findOne();
		} else {
			var info = TimeList.findOne();
		}
		return info;
	},
	'achievementName': function(id){
		return AchievementList.findOne({_id: id}).name;
	},
});

Template.discovery.created = function(){
	this.subscribe('user_game_info', Meteor.userId());
}

Template.discovery.helpers({
	'info': function(){
		return DiscoveryList.findOne();
	},
	'requirementsMet': function(){
		var discovery = DiscoveryList.findOne();
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		var met = 1;
		if(player.level < discovery.lvlReq){
			met--;
		}
		if(player.class != discovery.clsReq && discovery.clsReq != "none"){
			met--;
		}
		if(!player.achievements.includes(discovery.achReq) && discovery.achReq != ""){
			met--;
		}
		if(!player.story.includes(discovery.storyReq) && discovery.storyReq != ""){
			met--;
		}
		if(met > 0){
			Meteor.call('addDiscovery', discovery);
			return true;
		}

		return false;
	},
});

Template.time.helpers({
	'isActive': function(){
		if(TimeList.findOne().active){
			return true;
		}		
		return false;
	},
	'isAlive': function(){
		var time = TimeList.findOne();
		if(time.hp <= 0){
			Meteor.call('timeComplete', time, Meteor.userId());
			return false;
		}
		return true;
	},
	'participant': function(){
		var time = TimeList.findOne();
		if(time.participants.includes(Meteor.userId()) || time.oldParticipants.includes(Meteor.userId())){
			return true;
		}		
		return false;
	},
	'info': function(){
		return TimeList.findOne();
	},
	'curHP': function(cur, max){
		var hp = max - cur;
		hp = hp / max * 100;
		hp = 100 - hp;
		return hp;
	},
	'requirementsMet': function(){
		var time = TimeList.findOne();
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		var met = 1;
		if(player.level < time.lvlReq){
			met--;
		}
		if(player.class != time.clsReq && time.clsReq != "none"){
			met--;
		}
		if(!player.achievements.includes(time.achReq) && time.achReq != ""){
			met--;
		}
		if(!player.story.includes(time.storyReq) && time.storyReq != ""){
			met--;
		}
		if(met > 0){
			return true;
		}

		return false;
	},
});

Template.completed.helpers({	
	'info': function(){
		return TimeList.findOne();
	},
});

Template.time.events({
	'click .battle': function(){
		var time = TimeList.findOne();
		Meteor.call('fightTime', time);
		Meteor.call('addParticipant', time, Meteor.userId());
	},
});

Template.puzzle.helpers({
	'solved': function(){
		var puzzle = PuzzleList.findOne();
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		if(player.puzzle.includes(puzzle._id)){
			return true;
		}		
		return false;
	},
	'info': function(){
		return PuzzleList.findOne();
	},
	'requirementsMet': function(){
		var puzzle = PuzzleList.findOne();
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		var met = 1;
		if(player.level < puzzle.lvlReq){
			met--;
		}
		if(player.class != puzzle.clsReq && puzzle.clsReq != "none"){
			met--;
		}
		if(!player.achievements.includes(puzzle.achReq) && puzzle.achReq != ""){
			met--;
		}
		if(!player.story.includes(puzzle.storyReq) && puzzle.storyReq != ""){
			met--;
		}
		if(met > 0){
			return true;
		}

		return false;
	},
	'descLength': function(){
		var puzzle = PuzzleList.findOne();
		if(puzzle.description.length > 0) return true
		
		return false
	},
});

Template.puzzle.events({
	'submit form': function(e){
		e.preventDefault();
		var puzzle = PuzzleList.findOne();
		var answer = e.target.answer.value;
		Meteor.call('checkAnswer', puzzle, answer, Meteor.userId());
		e.target.answer.value = "";
	},
});

Template.character_sheet.onCreated(function(){
	this.subscribe('admin_achievements');
	this.subscribe('user_game_info', Meteor.userId());
});

Template.character_sheet.helpers({
	achievement: function(){
		return AchievementList.find({type: { $ne: "Rank" }});
	},
	mission: function(){
		return AchievementList.find({type: "Rank"});
	},
	hidden_achievement: function(id){
		var ach = AchievementList.findOne({_id: id});
		if(ach.type == "Normal" || ach.type == "Rank"){
			return false;
		}
		return true
	},
	achieved: function(id){
		var ach = AchievementList.findOne({_id: id});
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		if(player.achievements.includes(ach._id)){
			return true;
		}
		return false;
	},
	not_achieved: function(id){
		var ach = AchievementList.findOne({_id: id});
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		if(player.achievements.includes(ach._id)){
			return false;
		}
		return true;
	},
	not_hidden_ach: function(id){
		var ach = AchievementList.findOne({_id: id});
		if(ach.type == "Hidden" || ach.type == "Rank"){
			return false;
		}		
		return true
	},
	game_info: function(){
		return Meteor.users.findOne(Meteor.userId()).gameInfo;
	},
	level: function(){
		return Meteor.users.findOne(Meteor.userId()).gameInfo.level + 1;
	},
	max: function(){
		if(Meteor.users.findOne(Meteor.userId()).gameInfo.level >= 99){
			return true;
		}
		
		return false;
	}
});

Template.login.events({
	'submit form': function(e){
		e.preventDefault();
		var username = $('[name=username]').val();
		var password = $('[name=password]').val();
		Meteor.loginWithPassword(username, password, function(error){
			if(error){
				$(".error").text(error.reason);
			} else {
				location.reload();
				//Router.go("home");
			}
		});
	},
});

Template.register.events({
	'submit form': function(e){
		e.preventDefault();
		var username = $('[name=username]').val();
		var email = $('[name=email]').val();
		var password = $('[name=password]').val();
		var test = false;
		Accounts.createUser({
			username: username,
			email: email,
			password: password,
			}, function(err) {
				if (err){
					$(".error").text(err);
				} else {
					Meteor.loginWithPassword(username, password, function(error){
						if(error){
							$(".error").text(error.reason);
						} else {
							Meteor.call('initializeUser', Meteor.userId());
							Router.go("home", {replaceState: true});
						}
					});
			  }
		});
	},
});

Template.logout.onCreated(function(){
	Meteor.logout();
	Router.go('home');
});

Template.create_achievement.onCreated(function(){
    this.subscribe('admin_achievements');
});

Template.create_achievement.events({
	'submit form': function(e){
		e.preventDefault();
		var achNameVar = e.target.achName.value;
		var achTypeVar = e.target.achType.value;
		var achDescVar = e.target.achDesc.value;
		var achImgVar = e.target.achImg.value;
		if(Session.get('selectedAchievement')){
			Meteor.call('updateAchievement', Session.get('selectedAchievement'), achNameVar, achTypeVar, achDescVar, achImgVar);
		} else {
			Meteor.call('createAchievement', achNameVar, achTypeVar, achDescVar, achImgVar);
		}
		e.target.achName.value = "";
		e.target.achType.value = "";
		e.target.achDesc.value = "";
		e.target.achImg.value = "";
		Session.set('selectedAchievement', "");
	},
	'click .achievement': function(){
		var achievementId = this._id;
		if(Session.get('selectedAchievement') == achievementId){
			Session.set('selectedAchievement', "");
		} else {
			Session.set('selectedAchievement', achievementId);
		}
	},
	'click .selected .remove': function(){
		Meteor.call('remove', "a", this._id);
		Session.set('selectedAchievement', "");
	},
});

Template.create_achievement.helpers({
	'admin': function(){
		Meteor.call('admin', function (error, result) {
			Session.set("admin", result);
		});
		return Session.get("admin");
	},
	'achievement': function(){
		return AchievementList.find();
	},
	'selectedAddClass': function(){
		var achievementId = this._id;
		var selectedAchievement = Session.get('selectedAchievement');
		if(achievementId == selectedAchievement){
			return "selected"
		}
	},
	'selected': function(){
		var selectedAchievement = Session.get('selectedAchievement');
		return AchievementList.findOne(selectedAchievement);
	},
	'selected_normal': function(){
		var selectedAchievement = Session.get('selectedAchievement');
		if(Session.get('selectedAchievement') && AchievementList.findOne(selectedAchievement).type == "Normal"){
			return "selected";
		} else {
			return;
		}
	},
	'selected_hidden': function(){
		var selectedAchievement = Session.get('selectedAchievement');
		if(Session.get('selectedAchievement') && AchievementList.findOne(selectedAchievement).type == "Hidden"){
			return "selected";
		} else {
			return;
		}
	},
	'selected_rank': function(){
		var selectedAchievement = Session.get('selectedAchievement');
		if(Session.get('selectedAchievement') && AchievementList.findOne(selectedAchievement).type == "Rank"){
			return "selected";
		} else {
			return;
		}
	},
});

Template.create_time.onCreated(function(){
    this.subscribe('admin_time');
	this.subscribe('admin_achievements');
});

Template.create_time.events({
	'submit form': function(e){
		e.preventDefault();
		var timeNameVar = e.target.timeName.value;
		var timeCurHPVar = e.target.timeCurHP.value;
		var timeMaxHPVar = e.target.timeMaxHP.value;
		var timeXPVar = e.target.timeXP.value;
		var timeAchVar = e.target.timeAch.value;
		var timeLvlVar = e.target.timeLvl.value;
		var timeClsVar = e.target.timeCls.value;
		var timeAchReqVar = e.target.achReq.value;
		var timeStrReqVar = e.target.storyReq.value;
		var timeNotMetDescVar = e.target.notMetDesc.value;
		var timeDescVar = e.target.timeDesc.value;
		var timeImgVar = e.target.timeImg.value;
		var timeTypeVar = e.target.type.value;
		var timeButtonVar = e.target.buttonText.value;
		if(e.target.timeActive.checked){
			var timeActiveVar = true;
		} else {
			var timeActiveVar = false;
		}
		if(Session.get('selectedTime')){
			Meteor.call('updateTime', Session.get('selectedTime'), timeNameVar, timeCurHPVar, timeMaxHPVar, timeXPVar, timeActiveVar, timeAchVar, timeImgVar, timeDescVar, timeLvlVar, timeClsVar, timeAchReqVar, timeStrReqVar, timeNotMetDescVar, timeTypeVar, timeButtonVar);
		} else {
			Meteor.call('createTime', timeNameVar, timeCurHPVar, timeMaxHPVar, timeXPVar, timeActiveVar, timeAchVar, timeImgVar, timeDescVar, timeLvlVar, timeClsVar, timeAchReqVar, timeStrReqVar, timeNotMetDescVar, timeTypeVar, timeButtonVar);
		}
		e.target.timeName.value = "";
		e.target.timeCurHP.value = "";
		e.target.timeMaxHP.value = "";
		e.target.timeXP.value = "";
		e.target.timeAch.value = "none";
		e.target.timeLvl.value = "";
		e.target.timeCls.value = "none";
		e.target.achReq.value = "";
		e.target.storyReq.value = "";
		e.target.notMetDesc.value = "";
		e.target.timeDesc.value = "";
		e.target.buttonText.value = "";
		e.target.timeImg.value = "";
		e.target.type.value = "Multiple";
		e.target.timeActive.checked = false;
		Session.set('selectedTime', "");
	},
	'click .time': function(){
		var timeId = this._id;
		if(Session.get('selectedTime') == timeId){
			Session.set('selectedTime', "");
		} else {
			Session.set('selectedTime', timeId);
		}
	},
	'click .selected .remove': function(){
		Meteor.call('remove', "t", this._id);
		Session.set('selectedTime', "");
	},
});

Template.create_time.helpers({
	'admin': function(){
		Meteor.call('admin', function (error, result) {
			Session.set("admin", result);
		});
		return Session.get("admin");
	},
	'time': function(){
		return TimeList.find();
	},
	'hiddenAchievement': function(){
		return AchievementList.find({type: "Hidden"});
	},
	'selectedAddClass': function(){
		var timeId = this._id;
		var selectedTime = Session.get('selectedTime');
		if(timeId == selectedTime){
			return "selected"
		}
	},
	'selected': function(){
		var selectedTime = Session.get('selectedTime');
		return TimeList.findOne(selectedTime);
	},
	'selected_ach': function(){
		var selectedTime = Session.get('selectedTime');
		if(Session.get('selectedTime') && TimeList.findOne({_id: selectedTime}).achievement == this._id){
			return "selected";
		} else {
			return;
		}
	},
	'selected_class': function(typeValue){
		var selectedTime = Session.get('selectedTime');
		if(Session.get('selectedTime') && TimeList.findOne({_id: selectedTime}).clsReq == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'selected_type': function(typeValue){
		var selectedTime = Session.get('selectedTime');
		if(Session.get('selectedTime') && TimeList.findOne({_id: selectedTime}).type == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'achievement_name': function(){
		return AchievementList.findOne({_id: this.achievement}).name;
	},
	'isActive': function(){
		var selectedTime = Session.get('selectedTime');
		if(Session.get('selectedTime') && TimeList.findOne({_id: selectedTime}).active){
			return "checked";
		}
		return;
	},
});

Template.create_discovery.onCreated(function(){
    this.subscribe('admin_discoveries');
	this.subscribe('admin_achievements');
});

Template.create_discovery.events({
	'submit form': function(e){
		e.preventDefault();
		var dscNameVar = e.target.dscName.value;
		var dscXPVar = e.target.dscXP.value;
		var dscDescVar = e.target.dscDesc.value;
		var dscImgVar = e.target.dscImg.value;
		var dscLvlVar = e.target.dscLvl.value;
		var dscClsVar = e.target.dscCls.value;
		var dscTypeVar = e.target.dscType.value;
		var dscAchVar = e.target.dscAch.value;
		var dscAchReqVar = e.target.achReq.value;
		var dscStrReqVar = e.target.storyReq.value;
		var dscNotMetDescVar = e.target.notMetDesc.value;
		if(Session.get('selectedDiscovery')){
			Meteor.call('updateDiscovery', Session.get('selectedDiscovery'), dscNameVar, dscXPVar, dscDescVar, dscImgVar, dscLvlVar, dscClsVar, dscTypeVar, dscAchVar, dscAchReqVar, dscStrReqVar, dscNotMetDescVar);
		} else {
			Meteor.call('createDiscovery', dscNameVar, dscXPVar, dscDescVar, dscImgVar, dscLvlVar, dscClsVar, dscTypeVar, dscAchVar, dscAchReqVar, dscStrReqVar, dscNotMetDescVar);
		}
		e.target.dscName.value = "";
		e.target.dscXP.value = "";
		e.target.dscDesc.value = "";
		e.target.dscImg.value = "";
		e.target.dscLvl.value = "";
		e.target.dscCls.value = "none";
		e.target.dscType.value = "discovery";
		e.target.dscAch.value = "none";	
		e.target.achReq.value = "";
		e.target.storyReq.value = "";
		e.target.notMetDesc.value = "";
		Session.set('selectedDiscovery', "");
	},
	'click .discovery': function(){
		var discoveryId = this._id;
		if(Session.get('selectedDiscovery') == discoveryId){
			Session.set('selectedDiscovery', "");
		} else {
			Session.set('selectedDiscovery', discoveryId);
		}
	},
	'click .selected .remove': function(){
		Meteor.call('remove', "d", this._id);
		Session.set('selectedDiscovery', "");
	},
});

Template.create_discovery.helpers({
	'admin': function(){
		Meteor.call('admin', function (error, result) {
			Session.set("admin", result);
		});
		return Session.get("admin");
	},
	'discovery': function(){
		return DiscoveryList.find();
	},
	'selectedAddClass': function(){
		var discoveryId = this._id;
		var selectedDiscovery = Session.get('selectedDiscovery');
		if(discoveryId == selectedDiscovery){
			return "selected"
		}
	},
	'selected': function(){
		var selectedDiscovery = Session.get('selectedDiscovery');
		return DiscoveryList.findOne(selectedDiscovery);
	},
	'achievements': function(){
		return AchievementList.find();
	},
	'selected_ach': function(){
		var selectedTime = Session.get('selectedDiscovery');
		if(Session.get('selectedDiscovery') && DiscoveryList.findOne({_id: selectedTime}).ach == this._id){
			return "selected";
		} else {
			return;
		}
	},
	'selected_type': function(typeValue){
		var selectedTime = Session.get('selectedDiscovery');
		if(Session.get('selectedDiscovery') && DiscoveryList.findOne({_id: selectedTime}).type == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'selected_class': function(typeValue){
		var selectedTime = Session.get('selectedDiscovery');
		if(Session.get('selectedDiscovery') && DiscoveryList.findOne({_id: selectedTime}).clsReq == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'achievement_name': function(){
		return AchievementList.findOne({_id: this.achievement}).name;
	},
});

Template.create_puzzle.onCreated(function(){
    this.subscribe('admin_puzzles');
	this.subscribe('admin_achievements');
});

Template.create_puzzle.events({
	'submit form': function(e){
		e.preventDefault();
		var puzNameVar = e.target.puzName.value;
		var puzXPVar = e.target.puzXP.value;
		var puzAchVar = e.target.puzAch.value;
		var puzDescVar = e.target.puzDesc.value;
		var puzImgVar = e.target.puzImg.value;
		var puzAnsVar = e.target.puzAns.value;
		var puzNotMetDescVar = e.target.puzNotMetDesc.value;
		var puzSolvedDescVar = e.target.puzSolvedDesc.value;
		var puzLvlReqVar = e.target.puzLvlReq.value;
		var puzAchReqVar = e.target.puzAchReq.value;
		var puzStoryReqVar = e.target.puzStoryReq.value;
		var puzClsReqVar = e.target.puzClsReq.value;
		var puzTypeVar = e.target.puzType.value;
		if(Session.get('selectedPuzzle')){
			Meteor.call('updatePuzzle', Session.get('selectedPuzzle'), puzNameVar, puzXPVar, puzAchVar, puzImgVar, puzDescVar, puzAnsVar, puzNotMetDescVar, puzSolvedDescVar, puzLvlReqVar, puzAchReqVar, puzStoryReqVar, puzClsReqVar, puzTypeVar);
		} else {
			Meteor.call('createPuzzle', puzNameVar, puzXPVar, puzAchVar, puzImgVar, puzDescVar, puzAnsVar, puzNotMetDescVar, puzSolvedDescVar, puzLvlReqVar, puzAchReqVar, puzStoryReqVar, puzClsReqVar, puzTypeVar);
		}
		e.target.puzName.value = "";
		e.target.puzXP.value = "";
		e.target.puzAch.value = "none";
		e.target.puzDesc.value = "";
		e.target.puzImg.value = "";
		e.target.puzAns.value = "";
		e.target.puzNotMetDesc.value = "";
		e.target.puzSolvedDesc.value = "";
		e.target.puzLvlReq.value = "";
		e.target.puzAchReq.value = "";
		e.target.puzStoryReq.value = "";
		e.target.puzClsReq.value = "none";
		e.target.puzType.value = "none";
		Session.set('selectedPuzzle', "");
	},
	'click .puzzle': function(){
		var puzzleId = this._id;
		if(Session.get('selectedPuzzle') == puzzleId){
			Session.set('selectedPuzzle', "");
		} else {
			Session.set('selectedPuzzle', puzzleId);
		}
	},
	'click .selected .remove': function(){
		Meteor.call('remove', "p", this._id);
		Session.set('selectedPuzzle', "");
	},
});

Template.create_puzzle.helpers({
	'admin': function(){
		Meteor.call('admin', function (error, result) {
			Session.set("admin", result);
		});
		return Session.get("admin");
	},
	'puzzle': function(){
		return PuzzleList.find();
	},
	'achievement': function(){
		return AchievementList.find({type: "Normal"});
	},
	'selectedAddClass': function(){
		var puzzleId = this._id;
		var selectedPuzzle = Session.get('selectedPuzzle');
		if(puzzleId == selectedPuzzle){
			return "selected"
		}
	},
	'selected': function(){
		var selectedPuzzle = Session.get('selectedPuzzle');
		return PuzzleList.findOne(selectedPuzzle);
	},
	'selected_ach': function(){
		var selectedPuzzle = Session.get('selectedPuzzle');
		if(Session.get('selectedPuzzle') && PuzzleList.findOne({_id: selectedPuzzle}).ach == this._id){
			return "selected";
		} else {
			return;
		}
	},
	'selected_class': function(typeValue){
		var selectedPuzzle = Session.get('selectedPuzzle');
		if(Session.get('selectedPuzzle') && PuzzleList.findOne({_id: selectedPuzzle}).clsReq == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'selected_type': function(typeValue){
		var selectedPuzzle = Session.get('selectedPuzzle');
		if(Session.get('selectedPuzzle') && PuzzleList.findOne({_id: selectedPuzzle}).type == typeValue){
			return "selected";
		} else {
			return;
		}
	},
	'achievement_name': function(){
		return AchievementList.findOne({_id: this.achievement}).name;
	},
});