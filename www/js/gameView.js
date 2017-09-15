var gameView = function() {
}

gameView.renderBoard = function() {
	$("#board").css({width: Config.sqWidth*Config.numCols});
    for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++){
    		var color = "white";
    		if ((col + row) % 2 !== 0) {
				color = "black";
			}
			var squareId = 's' + col+'_'+row;
			$('#board').append('<div id="'+squareId+'" class="square ' + color+'"></div>');
			var topPos = row * Config.sqWidth;
			var leftPos = col * Config.sqWidth;
			//$('#'+squareId).css({"top": topPos, "left": leftPos, "width": Config.sqWidth-2, "height":Config.sqWidth-2});
			$('#'+squareId).css({"top": topPos, "left": leftPos});
      }
       
    }
    //$('#board').append(squares);
}

gameView.renderPiece = function(col, row, player, count) {
	var squareId = 's' + col+'_'+row;
	var pieceId = player + count;
	$('#' + squareId).append('<div id="' + pieceId + '" class="piece ' + player + '"><span>' + pieceId + '</span></div>');
	
	/*
	$('#'+pieceId).on("click", function(event) {
		game.selectPiece(pieceId, player);
		//$(document).trigger("pieceSelected", pieceId, player);
	});
	*/
}

gameView.selectPiece = function(pieceId) {
	$('#' + pieceId).addClass("selected");
}	

gameView.deselectPiece = function(pieceId) {
	$('#' + pieceId).removeClass("selected");
}

gameView.addPieceToSquare = function(pieceId, newSquare) {
	if (Config.devmode) {
		console.log("adding ", pieceId, " to square ", newSquare);
	}
	var piece = $('#'+pieceId).detach();
	piece.css({top:0,left:0});
	$('#s' + newSquare.col + '_' + newSquare.row).append(piece);
}

gameView.removePiece = function(pieceId) {
	$('#'+pieceId).remove();
}

gameView.dropPiece = function(pieceId,col,state) {
	$('#' + pieceId).animate({
		top: 0
	}, 400, function() {
    gameView.rebound(pieceId,col,state);
  });
}

gameView.rebound = function(pieceId,col,state) {
	$('#' + pieceId).animate({
		top: -20
	}, 80, function() {
		gameView.land(pieceId,col,state);
	});
}

gameView.land = function(pieceId,col,state) {
	$('#' + pieceId).animate({
		top: 0
	}, 80, function() {
    $(document).trigger("pieceDropped",[col,state]); 
  });
}

gameView.showWinningSquare = function(square) {
	var id = '#s'+square.col+'_'+square.row;
	$(id).addClass("winner");
}

gameView.hideArrow = function(arrowId) {
	$(arrowId + " img").css("display", "none");
}

gameView.hideAllArrows = function() {
	$(".arrow").css("display", "none");
}

/*
gameView.updateWinnerBox = function(result) {
	$('.winnerBox').remove();
	var playerText = "You Win!";
	var contText = "Continue?";
	var nextBtn = '<input type="button" value="Continue?" id="contBtn"/>';
	if (result === "pTwo wins") {
		playerText = "You Lose!";
		contText = "Rematch?";
		var nextBtn = '<input type="button" value="Rematch?" id="rematchBtn"/>';
	}
	$('#mainWindow').prepend('<div class="winnerBox"><div class="pName">' + playerText + '</div>'+nextBtn+'</div>');
}
*/

gameView.addWinnerText = function(text,button) {
	$('#winnerBox .pName').text(text);
	if (button === "Continue") {
		$('#winnerBox button').attr('id', "nextLevel");
		$('#winnerBox button').text("Continue?");
	} else {
		$('#winnerBox button').attr('id', "rematch");
		$('#winnerBox button').text("Rematch?");
	}
}

gameView.showWinnerBox = function(result) {
	$('#winnerBox').css("display", "block");
}

gameView.hideWinnerBox = function() {
	$('#winnerBox').css("display", "none");
} 

gameView.addOpacity = function() {
	$('#board').addClass('opaque');
}

gameView.removeOpacity = function() {
	$('#board').removeClass('opaque');
}

gameView.removeBoard = function() {
	$('.square').remove();
	$('.arrow').remove();
}