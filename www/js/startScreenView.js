function startScreenView() {
}

startScreenView.buildStartScreen = function(level) {
	if (!level) {
		level = 1;
	}
	$('.start .level').text("LEVEL " + level + "!");
	
	//$('<div class="start"><p class="level">LEVEL ' + level + '!</p><input type="button" value="GO!" id="goButton"/>').appendTo('#start_screen');
}

startScreenView.showStartScreen = function() {
	$('#start_screen').css('display', 'block');
}

startScreenView.hideStartScreen = function() {
	$('#start_screen').css('display', 'none');
}

