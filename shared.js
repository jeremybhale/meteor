AchievementList = new Mongo.Collection('achievements');
TimeList = new Mongo.Collection('times');
DiscoveryList = new Mongo.Collection('discoveries');
PuzzleList = new Mongo.Collection('puzzles');

Meteor.methods({
	'createAchievement': function(achName, achType, achDesc, achImg){
        AchievementList.insert({
            name: achName,
			type: achType,
            description: achDesc,
            img: achImg,
        });
    },
	'updateAchievement': function(ID, achName, achType, achDesc, achImg){
		AchievementList.update(ID, { $set: {
            name: achName,
			type: achType,
            description: achDesc,
            img: achImg,
        }});
	},
	'createTime': function(timeName, timeCurHP, timeMaxHP, timeXP, timeActive, timeAch, timeImg, timeDesc, timeLvl, timeCls, timeAchReq, timeStrReq, timeNotMetDesc, type, buttonText){
        TimeList.insert({
            name: timeName,
			hp: parseInt(timeCurHP),
			maxHP: parseInt(timeMaxHP),
			xp: parseInt(timeXP),
			active: timeActive,
			ach: timeAch,
			img: timeImg,
			description: timeDesc,
			participants: [],
			oldParticipants: [],
			lvlReq: timeLvl,
			achReq: timeAchReq,
			storyReq: timeStrReq,
			clsReq: timeCls,
			notMetDescription: timeNotMetDesc,
			type: type,
			buttonText: buttonText,
			resetTimer: 0,
        });
    },
	'updateTime': function(ID, timeName, timeCurHP, timeMaxHP, timeXP, timeActive, timeAch, timeImg, timeDesc, timeLvl, timeCls, timeAchReq, timeStrReq, timeNotMetDesc, type, buttonText){
		TimeList.update(ID, { $set: {
            name: timeName,
			hp: parseInt(timeCurHP),
			maxHP: parseInt(timeMaxHP),
			xp: parseInt(timeXP),
			active: timeActive,
			ach: timeAch,
			img: timeImg,
			description: timeDesc,
			participants: [],
			oldParticipants: [],
			lvlReq: timeLvl,
			achReq: timeAchReq,
			storyReq: timeStrReq,
			clsReq: timeCls,
			notMetDescription: timeNotMetDesc,			
			type: type,
			buttonText: buttonText,
			resetTimer: 0,
        }});
	},
	'resetTime': function(id){
		var timeCurHP = TimeList.findOne(id).maxHP;
		TimeList.update(id, { $set: {
			hp: parseInt(timeCurHP),
			participants: [],
			oldParticipants: [],
			resetTimer: 0,
        }});
	},
	'createDiscovery': function(dscName, dscXP, dscDesc, dscImg, lvlReq, clsReq, type, ach, achReq, storyReq, notMetDesc){
        DiscoveryList.insert({
            name: dscName,
			xp: parseInt(dscXP),
            description: dscDesc,
			notMetDescription: notMetDesc,
            img: dscImg,
			lvlReq: lvlReq,
			achReq: achReq,
			storyReq: storyReq,
			clsReq: clsReq,
			type: type,
			ach: ach,
        });
    },
	'updateDiscovery': function(ID, dscName, dscXP, dscDesc, dscImg, lvlReq, clsReq, type, ach, achReq, storyReq, notMetDesc){
		DiscoveryList.update(ID, { $set: {
            name: dscName,
			xp: parseInt(dscXP),
            description: dscDesc,
			notMetDescription: notMetDesc,
            img: dscImg,
			lvlReq: lvlReq,
			achReq: achReq,
			storyReq: storyReq,
			clsReq: clsReq,
			type: type,
			ach: ach,
        }});
	},
	'createPuzzle': function(name, xp, ach, img, desc, answer, notMetDesc, solvedDesc, lvlReq, achReq, storyReq, clsReq, type){
        PuzzleList.insert({
            name: name,
			xp: parseInt(xp),
			ach: ach,
			img: img,
			description: desc,
			answer: answer,
			notMetDescription: notMetDesc,
			solvedDesc: solvedDesc,
			lvlReq: lvlReq,
			achReq: achReq,
			storyReq: storyReq,
			clsReq: clsReq,
			type: type,
        });
    },
	'updatePuzzle': function(ID, name, xp, ach, img, desc, answer, notMetDesc, solvedDesc, lvlReq, achReq, storyReq, clsReq, type){
		PuzzleList.update(ID, { $set: {
            name: name,
			xp: parseInt(xp),
			ach: ach,
			img: img,
			description: desc,
			answer: answer,
			notMetDescription: notMetDesc,
			solvedDesc: solvedDesc,
			lvlReq: lvlReq,
			achReq: achReq,
			storyReq: storyReq,
			clsReq: clsReq,
			type: type,
        }});
	},
	'addDiscovery': function(discovery){
		if(Meteor.isServer){
			var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
			if(discovery.type == "discovery"){
				if(!player.discoveries.includes(discovery._id)){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.discoveries': discovery._id,
					  },
					  $inc: {
						'gameInfo.xp': discovery.xp,
					  }
					});
					var id = Meteor.userId();
					Meteor.setTimeout(function(){
						Meteor.users.update(id, {
						  $push: {
							'gameInfo.story': discovery._id,
						  },
						});
					}, 10000);
					Meteor.call('levelUp', Meteor.userId());				
					Meteor.call('checkDiscoveryAch');
				}
			} else if(discovery.type == "sand" && player.eggs.length <= 10){
				if(!player.eggs.includes(discovery._id)){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.eggs': discovery._id,
					  },
					  $inc: {
						'gameInfo.xp': discovery.xp,
					  }
					});
					Meteor.call('levelUp', Meteor.userId());
					Meteor.call('checkEggAch');
				}
			} else if(discovery.type == "delivery" && player.deliveries.length <= 10){
				if(!player.deliveries.includes(discovery._id)){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.deliveries': discovery._id,
					  },
					  $inc: {
						'gameInfo.xp': discovery.xp,
					  }
					});
					Meteor.call('levelUp', Meteor.userId());
					Meteor.call('checkDeliveryAch');
				}
			} else if(discovery.type == "informational"){
				if(!player.informational.includes(discovery._id)){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.informational': discovery._id,
					  },
					  $inc: {
						'gameInfo.xp': discovery.xp,
					  }
					});
					var id = Meteor.userId();
					Meteor.setTimeout(function(){
						Meteor.users.update(id, {
						  $push: {
							'gameInfo.story': discovery._id,
						  },
						});
					}, 10000);
					if(discovery.ach != "none"){
						Meteor.users.update(Meteor.userId(), {
						  $push: {
							'gameInfo.achievements': discovery.ach,
						  },
						});
					}
					Meteor.call('levelUp', Meteor.userId());
				}
			}
		}
	},
	'checkDiscoveryAch': function(){
		if(Meteor.isServer){
			var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
			var exploreOne = AchievementList.findOne({ name: 'Dave' })._id;
			if(player.discoveries.length >= 10 && !player.achievements.includes(exploreOne)){
				Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
			}
			exploreOne = AchievementList.findOne({ name: 'Alfred' })._id;
			if(player.discoveries.length >= 25 && !player.achievements.includes(exploreOne)){
				Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
			}
			exploreOne = AchievementList.findOne({ name: 'Estevanico' })._id;
			if(player.discoveries.length >= 50 && !player.achievements.includes(exploreOne)){
				Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
			}
		}
	},
	'checkEggAch': function(player){
		if(Meteor.isServer){
			var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
			var exploreOne = AchievementList.findOne({ name: 'Sand Hunter' })._id;
			if(player.eggs.length >= 10 && !player.achievements.includes(exploreOne)){
				Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
			}
		}
	},
	'checkDeliveryAch': function(player){
		if(Meteor.isServer){
			var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
			var exploreOne = AchievementList.findOne({ name: 'Deliverance' })._id;
			if(player.deliveries.length >= 10 && !player.achievements.includes(exploreOne)){
				Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
			}
		}
	},
	'levelUp': function(id){
		if(Meteor.isServer){
			if(Meteor.users.findOne(id).gameInfo.level == 99){
				Meteor.users.update(id, {
					$set: {
						'gameInfo.xp': 100,
					}
				});
			} else {
				var player = Meteor.users.findOne(id).gameInfo;
				if(player.xp >= 100) {
					Meteor.users.update(id, {
					  $inc: {
						'gameInfo.xp': -100,
						'gameInfo.level': 1,
					  }
					});
					Meteor.call('levelUp', id);
				}
			}
		}
	},
	'addParticipant': function(time, player){
		if(Meteor.isServer){
			if(!time.participants.includes(player)){
				TimeList.update(time._id, {$push: {participants: player}});
			}
		}
	},
	'fightTime': function(time){
		var attack = -1;
		var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
		if(player.class == "Fighter") {
			attack = -3;
		}
		TimeList.update(time._id, {$inc: {hp: attack}});
	},
	'timeComplete': function(time){
		if(Meteor.isServer){
			time.participants.forEach(function(element){
				var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
				if(!player.times.includes(time._id)){
					Meteor.users.update(element, {
					  $push: {
						'gameInfo.times': time._id,
					  },
					  $inc: {
						'gameInfo.xp': time.xp,
					  }
					});
					Meteor.setTimeout(function(){
						Meteor.users.update(element, {
						  $push: {
							'gameInfo.story': time._id,
						  },
						});
					}, 10000);
					if(time.ach != "none"){
						Meteor.users.update(Meteor.userId(), {
						  $push: {
							'gameInfo.achievements': time.ach,
						  },
						});
					}
					Meteor.call('levelUp', element);
				}
				TimeList.update(time._id, {
					$pull: {
						participants: element,
					},
					$push: {
						oldParticipants: element,
					},
				});
			});
			
			if(time.resetTimer == 0 && time.type == "Multiple"){
				TimeList.update(time._id, {
					$set: {
						resetTimer: 1,
					},
				});
				Meteor.setTimeout(function(){
					Meteor.call('resetTime', time._id);
				}, 10000);
			} else if(time.type == "Single") {
				Meteor.setTimeout(function(){
					TimeList.update(time._id, {
						$set: {
							active: false,
						},
					});
				}, 10000);
			}
		}
	},
	'checkAnswer': function(puzzle, answer){
			if(puzzle.answer.toLowerCase() == answer.toLowerCase() && puzzle.type != "choice"){
				Meteor.users.update(Meteor.userId(), {
				  $push: {					
					'gameInfo.puzzle': puzzle._id,  
				  },
				  $inc: {
					'gameInfo.xp': puzzle.xp,
				  },
				});
				if(puzzle.ach != "none"){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.achievements': puzzle.ach,
					  },
					});
				}
				var id = Meteor.userId();
				Meteor.setTimeout(function(){
					Meteor.users.update(id, {
					  $push: {
						'gameInfo.story': puzzle._id,
					  },
					});
				}, 10000);
				var code = 0;
				if(puzzle.type == "code"){
					Meteor.users.update(Meteor.userId(), {
					  $push: {
						'gameInfo.codes': puzzle._id,
					  },
					});
					var player = Meteor.users.findOne(Meteor.userId()).gameInfo;
					var exploreOne = AchievementList.findOne({ name: 'Code Cracker' })._id;
					if(player.codes.length >= 10 && !player.achievements.includes(exploreOne)){
						Meteor.users.update(Meteor.userId(), {$push: {'gameInfo.achievements': exploreOne}});
					}
				}
				Meteor.call('levelUp', Meteor.userId());
			} else if (puzzle.type == "choice" && answer.toLowerCase() == "fighter") {
				Meteor.users.update(Meteor.userId(), {
					$set: {
						'gameInfo.class': "Fighter",
					},
					$push: {
						'gameInfo.story': puzzle._id,
						'gameInfo.puzzle': puzzle._id,
						'gameInfo.achievements': AchievementList.findOne({ name: 'Class Act' })._id,
					},
					$inc: {
						'gameInfo.xp': puzzle.xp,
					},
				});
				Meteor.call('levelUp', Meteor.userId());
			} else if (puzzle.type == "choice" && answer.toLowerCase() == "scholar") {
				Meteor.users.update(Meteor.userId(), {
					$set: {
						'gameInfo.class': "Scholar",
					},
					$push: {
						'gameInfo.story': puzzle._id,
						'gameInfo.puzzle': puzzle._id,
						'gameInfo.achievements': AchievementList.findOne({ name: 'Class Act' })._id,
					},
					$inc: {
						'gameInfo.xp': puzzle.xp,
					},
				});
				Meteor.call('levelUp', Meteor.userId());
			} else if (puzzle.type == "choice" && answer.toLowerCase() == "rogue") {
				Meteor.users.update(Meteor.userId(), {
					$set: {
						'gameInfo.class': "Rogue",
					},
					$push: {
						'gameInfo.story': puzzle._id,
						'gameInfo.puzzle': puzzle._id,
						'gameInfo.achievements': AchievementList.findOne({ name: 'Class Act' })._id,
					},
					$inc: {
						'gameInfo.xp': puzzle.xp,
					},
				});
				Meteor.call('levelUp', Meteor.userId());
			} else {
				Meteor.call('wrong');				
			}
	},
	'wrong': function(){
		if(Meteor.isClient){
			console.log("wrong");
			$(".error").text("INCORRECT");
			$( "input[name=answer]" ).focus(function() {
				$(".error").html("&nbsp;");
			});
		}
	},
	'initializeUser': function(userId){
		const newGameInfo = {
			class: 'Adventurer',
            xp: parseInt(0),
            level: parseInt(1),
			discoveries: [],
			times: [],
			achievements: [],
			eggs: [],
			codes: [],
			deliveries: [],
			informational: [],
			story: [],
			puzzle: [],
		};
		
		Meteor.users.update(userId, {
		  $set: {
			gameInfo: newGameInfo,
		  }
		});
	},
	'admin': function(){
		if(Meteor.isServer){
			if(Meteor.user() && Meteor.user().username.toLowerCase() == "calmcacil"){
				return true;
			}
			
			return false;
		}
	},
	'remove': function(list, id){
		if(Meteor.isServer){
			if(list == "p") {
				PuzzleList.remove(id);
			} else if(list == "d") {
				DiscoveryList.remove(id);
			} else if(list == "t") {
				TimeList.remove(id);
			} else if(list == "a") {
				AchievementList.remove(id);
			}
		}
	},
});