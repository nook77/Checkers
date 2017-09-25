var gameView = function() {
}

gameView.renderBoard = function() {
	$("#board").css({width: Config.sqWidth*Config.numCols,
					 height: Config.sqWidth*Config.numRows});
    for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++){
    		var color = "white";
    		if ((row + col) % 2 !== 0) {
				color = "black";
			}
			var squareId = 's' + row+'_'+col;
			$('#board').append('<div id="'+squareId+'" class="square ' + color+'"></div>');
			var topPos = row * Config.sqWidth;
			var leftPos = col * Config.sqWidth;
			$('#'+squareId).css({"top": topPos, "left": leftPos});
      }
       
    }
    //$('#board').append(squares);
}

gameView.renderPiece = function(col, row, player, count) {
	var squareId = 's' + row+'_'+col;
	var pieceId = player + count;
	$('#' + squareId).append('<div id="' + pieceId + '" class="piece ' + player + '"><span>'+pieceId+'</span></div>');
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
	$('#s' + newSquare.row + '_' + newSquare.col).append(piece);
}

gameView.removeAllPieces = function() {
	$('.piece').remove();
}

gameView.showplayer = function(player) {
	$('#'+player+'Box .player_name').addClass('border');
}

gameView.showChangeTurn = function() {
	$('#pOneBox .player_name').toggleClass('border');
	$('#pTwoBox .player_name').toggleClass('border');
}

gameView.removePiece = function(pieceId) {
	$('#'+pieceId).remove();
}

gameView.addPieceToLostPieces = function(pieceId,player) {
	var piece = $('#'+pieceId).detach();
	$('#'+player+'Box .lost_pieces').append(piece);
}

gameView.addWinnerText = function(text,button) {
	$('#winnerBox .pName').text(text);
	if (button === "Continue") {
		$('#winnerBox button').attr('id', "nextLevel");
		$('#winnerBox button').text("Next Level?");
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

gameView.addOpacity = function(id) {
	if (!id) {
		id = board;
	}
	$('#'+id).addClass('opaque');
}

gameView.removeOpacity = function(id) {
	if (!id) {
		id = board;
	}
	
	$('#'+id).removeClass('opaque');
}

gameView.removeBoard = function() {
	$('.square').remove();
	$('.arrow').remove();
}