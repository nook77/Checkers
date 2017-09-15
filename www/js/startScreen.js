var startScreen = function() {
}

startScreen.bindClicks = function(level) {
	$('#startGame').on("click", function(event) {
		game.init(level);
	});
}

startScreen.unBindClicks = function() {
	$('#startGame').off("click");
}
