/* Think I probably should create a Piece object. Would hold Id, currentSquare, plus if it's a King. When checking for available moves, if the piece is Kinged we could add the alternate players move directions to the moveDirections array.

We're gonna make this shit draggable. I think everything I need is here: https://jqueryui.com/droppable/#accepted-elements

thinking about adding a div to all the squares called "accept". These will be displayed when they are squares that can accept moves. They will be position:absolute, and background:black, same height and width as the parent square div. When hovered on they will expand, I think %128, and transform:translate(-12%,-12%).

Something I could do is at the start of each turn is figure out all of the available moves for the player. And then I can set the available squares to accept the pieces that can be played there. This will take care of jumping issues and everything! So all of a players pieces will be draggable during their turn, but the squares will know that they can only accept certain pieces
*/ 

var game = {

	init: function(level){
		_this = this;
		_this.rows = Config.numRows;
		_this.cols = Config.numCols;
		//_this.squares = new Object();
		_this.pieces = new Object();
		_this.players = "one";
		_this.state = new State(undefined,level);
		_this.ai = new AI(level);
		_this.availableMoves = new Array();
		_this.moveDirections = {pOne: ['ne', 'nw'],
								pTwo: ['se', 'sw']
								};
		_this.kingDirections = ['ne', 'nw', 'se', 'sw'];						
		
		gameView.removeOpacity();
		game.setAllSquaresDroppable(game.state.board);
		game.addPieces(game.state.board);
		startScreenView.hideStartScreen();
		
		//startScreenView.buildMainMenu();
		//startScreen.bindClicks();
		
		//console.log("starting a game at level " + level);
		//allowing dragging of current player's pieces
		$('.'+game.state.playerTurn).draggable({disabled:false, revert: true, revertDuration: 10, zIndex:100});
		
		//disable dragging of opponent's pieces
		$('.'+game.getToggledPlayerTurn(game.state.playerTurn)).draggable({disabled:true});
		$(document).trigger("playerMove", game.state.playerTurn);
	}	
}

game.buildBoard = function(board) {
	if (Config.devmode) {
		console.log("buildBoard");
	}
	var newBoard = [];
	for (var col = 0; col < Config.numCols;col++) {
		newBoard[col] = new Array();
    	for (var row = 0; row < Config.numRows;row++){
    		if ((col + row) % 2 !== 0) {
				newBoard[col][row] = "empty";
				
				if (typeof board !== "undefined") {
					newBoard[col][row] = board[col][row];
				}
			} else {
				newBoard[col][row] = "null";
			}
		}
    }	
	return newBoard;
}

game.setAllSquaresDroppable = function(board) {
	for (var col = 0; col < Config.numCols;col++) {
    	for (var row = 0; row < Config.numRows;row++){
			if (board[col][row] === "empty") {
				//Setting the square as droppable. 
				$('#s'+col+'_'+row).droppable({
					//It will only accept pieces that have a class matching the squares ID.
					accept: '.s'+col+'_'+row,
					drop: function(event, ui) {
						var pieceId = ui.draggable[0].id;
						var sqId = '#s'+squares.getCol(this.id)+'_'+squares.getRow(this.id);
						var square = {col:squares.getCol(this.id),
									  row:squares.getRow(this.id)
									  };  
						var top = parseInt($(sqId).css("top")) + 6 + "px";
						var left = parseInt($(sqId).css("left")) + 6 + "px";
						$(sqId).css({"border-color":"black","width":"73px","height":"73px","top":top,"left":left});     		
						$(document).trigger("pieceDropped", [pieceId, square, game.state]);
					},
					over: function(event, ui) {
						
						var sqId = '#s'+squares.getCol(this.id)+'_'+squares.getRow(this.id);
						$(sqId).css({"border-color":"white"});
						var top = parseInt($(sqId).css("top")) - 6 + "px";
						var left = parseInt($(sqId).css("left")) - 6 + "px";
						$(sqId).css({
							width: "86px",
							height: "86px",
							top: top,
							left: left
							//transform: "translate(-50px,-50px)"
						});
					},
					out: function(event, ui) {
						var sqId = '#s'+squares.getCol(this.id)+'_'+squares.getRow(this.id);
						var top = parseInt($(sqId).css("top")) + 6 + "px";
						var left = parseInt($(sqId).css("left")) + 6 + "px";
						$(sqId).css({"border-color":"black"});
						$(sqId).css({
							width: "73px",
							height: "73px",
							top: top,
							left: left
						});
					}
				});
			}
		}
	}
}

game.addPieces = function(board) {
	if (Config.devmode) {
		console.log("addPieces");
	}
	var count = 1;
	for (var row = Config.numRows - 1; row >= 0;row--) {
		for (var col = Config.numCols - 1; col >= 0;col--) {
			if (board[col][row] === "empty") {
			
				gameView.renderPiece(col, row, "pOne", count);
				var piece = new Piece("pOne" + count, {col:col,row:row}, "pOne", game.moveDirections.pOne);
				
				game.pieces["pOne" + count] = piece;
				board[col][row] = piece.id;
				count++;
			}
			if (count > Config.numPlayerPieces) {
				break;
			}
		}
		if (count > Config.numPlayerPieces) {
			break;
		}
    }
    
    //player two pieces
	count = 1;
	for (var row = 0; row < Config.numRows;row++) {
		for (var col = 0; col < Config.numCols;col++) {
			if (board[col][row] === "empty") {
				//game.squares['s'+col+'_'+row].occupiedBy = "pOne";
				//game.squares['s'+col+'_'+row].pieceId = "pOne" + count;
				gameView.renderPiece(col, row, "pTwo", count);
				var piece = new Piece("pTwo" + count, {col:col,row:row}, "pTwo", game.moveDirections.pTwo);
				game.pieces["pTwo" + count] = piece;
				board[col][row] = piece.id;
				count++;
			}
			if (count > Config.numPlayerPieces) {
				break;
			}
		}
		if (count > Config.numPlayerPieces) {
			break;
		}
    }
	
}

game.selectPiece = function(pieceId, player) {
	if (!$('#' + pieceId).hasClass(game.state.playerTurn)) {
		return false;
	}
	if (game.state.selectedPiece !== "") {
		gameView.deselectPiece(game.state.selectedPiece);
		game.state.selectedPiece = "";
	}
	game.state.selectedPiece = pieceId;
	gameView.selectPiece(pieceId);
	game.deActivateAllSquares();
	game.activateAvailableSquares(pieceId, player, game.state.board);
}

game.deselectPiece = function(pieceId) {
	game.state.selectedPiece = "";
	gameView.deselectPiece(pieceId);
}

/*
game.activateAvailableSquares = function(pieceId, player, board) {
	var currentSquare = $('#'+pieceId).parent().attr('id');
	var availableMoves = game.getAvailableMoves(currentSquare, player, board, pieceId);
	for (var i=0; i<availableMoves.length; i++) {
		var squareId = 's' + availableMoves[i].newSquare.col + "_" + availableMoves[i].newSquare.row;
		
		var pieceId = availableMoves[i].pieceId;
		var currentSquare = availableMoves[i].currentSquare;
		var newSquare = availableMoves[i].newSquare;
		var jumpedSquare = availableMoves[i].jumpedSquare;
		var player = availableMoves[i].player;
		
		var data = {pieceId:pieceId,
					currentSquare:currentSquare,
					jumpedSquare:jumpedSquare,
					player:player
					};
		$('#' + squareId).on("click", function(event) {
			game.movePiece(data, $(this).attr('id'));
		});
	}
	console.log("availableMoves:")
	console.log(availableMoves);
	return availableMoves;
}
*/

game.activateMovablePieces = function(moves) {
	for (var i=0; i<moves.length; i++) {
		var newSqId = squares.getSquareId(moves[i].newSquare);
		//$('#'+moves[i].pieceId).draggable({
		//	snap: '#'+newSqId
    	//});
    	if (moves[i].jumpedSquare) {
    		game.pieces[moves[i].pieceId].isJumping = true;
    		//game.state[moves[i].player+"Pieces"][moves[i].pieceId].isJumping = true;
    	}
    	$('#'+moves[i].pieceId).addClass(newSqId);
	}
}

game.disablePlayersPieces = function(player) {
	for (piece in game.pieces) {
		$('#'+piece).removeClass (function (index, css) {
    		return (css.match(/(s[0-9]_[0-9]\s?)/g) || []).join(' ');
		});
	}
}

game.activateAvailableSquares = function(moves) {
	//console.log(moves);
	
	for (var i=0; i<moves.length; i++) {
		var newSqId = squares.getSquareId(moves[i].newSquare);
		$('#'+moves[i].pieceId).addClass(newSqId);
	}
}

//game.addPieceToSquare(pieceId,square

game.getAvailableMoves = function(player, board, id) {
	var pieceId;
	var moves = [];
	var jumps = [];
	//console.log(playerPieces);
	
	if (id) {
		var piece = game.pieces[id];
		var currentSquare = piece.inSquare;
		var col = piece.inSquare.col;
		var row = piece.inSquare.row;
		var nextSquare;
		var dirs;
		
		if (piece.isKing) {
			dirs = game.kingDirections;
		} else {
			dirs = game.moveDirections[player];
		}
		
		for (var i=0; i<dirs.length; i++) {
			if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
				if (board[nextSquare.col][nextSquare.row] !== "empty") {
					var pieceInSquareId = board[nextSquare.col][nextSquare.row];
					var pieceInSquare = game.pieces[pieceInSquareId];
					if (pieceInSquare.player === game.getToggledPlayerTurn(player)) {
						if (game.isJumpable(nextSquare, dirs[i], player, board)) {
							var jumpedSquare = nextSquare;
							nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
							
							var move = new Move(id, currentSquare, nextSquare, jumpedSquare, player);
							jumps.push(move);
						}
					}
				}
			}
		}
	} else {
		for (pieceId in game.pieces) {
			var piece = game.pieces[pieceId];
			if (piece.player !== player) {
				continue;
			}
			var currentSquare = piece.inSquare;
			var col = piece.inSquare.col;
			var row = piece.inSquare.row;
			var nextSquare;
			var dirs;
		
			if (piece.isKing) {
				dirs = game.kingDirections;
			} else {
				dirs = game.moveDirections[player];
			}
			
			for (var i=0; i<dirs.length; i++) {
				if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
					if (board[nextSquare.col][nextSquare.row] === "empty") {
						var move = new Move(pieceId, currentSquare, nextSquare, '', player);
						moves.push(move);
					} else {
						var pieceInSquareId = board[nextSquare.col][nextSquare.row];
						var pieceInSquare = game.pieces[pieceInSquareId];
						if (pieceInSquare.player === game.getToggledPlayerTurn(player)) {
							if (game.isJumpable(nextSquare, dirs[i], player, board)) {
								var jumpedSquare = nextSquare;
								nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
								
								var move = new Move(pieceId, currentSquare, nextSquare, jumpedSquare, player);
								jumps.push(move);
							}
						}
					}
				}
			}
		}
	}
	if (jumps.length > 0) {
		if (Config.devmode) {
			console.log("Jumps available!");
		}
		game.state.jumps = true;
		return jumps;
	} else {
		game.state.jumps = false;
		return moves;
	}
}

/*
game.getAvailableMoves = function(square, player, board, pieceId) {
	console.log(square);
	var moves = [];
	var jumps = [];
	var col = squares.getCol(square);
	var row = squares.getRow(square);
	var coords = {col: col, row: row};
	var nextSquare;
	var dirs = game.moveDirections[player];
	if (game.state[player+"Pieces"][pieceId].isKing) {
		for (var a=0;a<game.moveDirections[game.getToggledPlayerTurn(player)].length;a++) {
			dirs.push(game.moveDirections[game.getToggledPlayerTurn(player)][a]);
		}
	}
	
	for (var i=0; i<dirs.length; i++) {
		nextSquare = squares.getNextSquareInDirection(coords, dirs[i]);
		if (nextSquare && board[nextSquare.col][nextSquare.row] === "empty") {
			var move = new Move(pieceId, coords, nextSquare, '', player);
			moves.push(move);
		} else if (nextSquare && board[nextSquare.col][nextSquare.row] === game.getToggledPlayerTurn(player)) {
			if (game.isJumpable(nextSquare, dirs[i], player, board)) {
				var jumpedSquare = nextSquare;
				nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
				
				var move = new Move(pieceId, coords, nextSquare, jumpedSquare, player);
				jumps.push(move);
			}
		}
	}
	
	if (jumps.length > 0) {
		return jumps;
	}
	
	return moves;
}
*/

game.isJumpable = function(square, dir, currentPlayer, board) {

	var coords = {col: square.col, row: square.row};
	var nextSquare = squares.getNextSquareInDirection(coords, dir);
	if (!nextSquare) {
		return false;
	}
	
	if (board[nextSquare.col][nextSquare.row] !== "empty") {
		return false;
	}
	
	return true;
}

game.findJumps = function(player, board) {
	
	var dirs = game.moveDirections[player];
	var jumps = [];
	for (var col = 0; col < Config.numCols;col++) {
    	for (var row = 0; row < Config.numRows;row++) {	
    		if (board[col][row] === player) {
    			var coords = {col: col, row: row};
    			for (var i=0; i<dirs.length; i++) {
    				var nextSquare = squares.getNextSquareInDirection(coords, dirs[i]);
    				if (nextSquare && board[nextSquare.col][nextSquare.row] === game.getToggledPlayerTurn(player)) {
    					if (game.isJumpable(nextSquare, dirs[i], player, board)) {
    						jumps.push(coords);
    					}
    				}
    			}
    		}	
    	}
    }
    return jumps;
}

game.movePiece = function(data,squareId) {
	
	var pieceId = data.pieceId;
	var square = data.currentSquare;
	var jumpedSquare = data.jumpedSquare;
	var player = data.player;
	var newSquare = {col:squares.getCol(squareId),
					 row:squares.getRow(squareId)
					 };
					 
	if (game.state.jumps.length > 0 && !jumpedSquare) {
		alert("You must make jumps fuckhead!");
		return false;
	}
	
	console.log("movePiece");
	console.log("pieceId: " + pieceId  + " moving to: ");
	console.log(newSquare);
	console.log("from: ");
	console.log(square);
	game.state.board[square.col][square.row] = "empty";
	game.state.board[newSquare.col][newSquare.row] = player;
	//game.squares[square.col+'_'+square.row].occupiedBy = "empty";
	//game.squares[square.col+'_'+square.row].pieceId = "";
	//game.squares[newSquare.col+'_'+newSquare.row].occupiedBy = player;
	//game.squares[newSquare.col+'_'+newSquare.row].pieceId = pieceId;
	gameView.addPieceToSquare(pieceId, newSquare);
	console.log("new Board:");
	console.log(game.state.board);
	//console.log("new Squares:");
	//console.log(game.squares);
	
	if (player === "pOne" && newSquare.row == 0) {
		console.log("pOne King");
		game.state.pOnePieces[pieceId].isKing = true;
		$('#'+pieceId).addClass("king");
	} else if (player === "pTwo" && newSquare.row == Config.numRows - 1) {
		console.log("pTwo King");
		game.state.pTwoPieces[pieceId].isKing = true;
		$('#'+pieceId).addClass("king");
	}
	game.state.selectedPiece = "";
	gameView.deselectPiece(pieceId);
	game.deActivateAllSquares();
	if (jumpedSquare !== '') {
		console.log("we have jumped: " + jumpedSquare);
		game.removePieceFromSquare(jumpedSquare);
		game.state.jumps = [];
		//game.state.jumps = game.findJumps(player,game.state.board);
		game.state[game.getToggledPlayerTurn(player)+"PiecesNum"]--;
		game.activateAvailableSquares(pieceId, player, game.state.board);
		if (game.checkForWin(player)) {
			console.log(player + " wins!");
		}
	}
	
	if (game.state.jumps.length === 0) {
		console.log("pOne has " + game.state.pOnePiecesNum);
		console.log("pTwo has " + game.state.pTwoPiecesNum);
		console.log("turn complete");
		
		game.state.playerTurn = game.getToggledPlayerTurn(game.state.playerTurn);
		$(document).trigger("moveComplete", game.state.playerTurn);
		console.log("player turn: " + game.state.playerTurn);
	}
}

game.removePieceFromSquare = function(square) {
	if (Config.devmode) {
		console.log("removePieceFromSquare ", square);
	}
	var squareId = squares.getSquareId(square);
	var pieceId = game.state.board[square.col][square.row];
	game.state.board[square.col][square.row] = "empty";
	game.pieces[pieceId] = '';
	//game.squares[squareId].occupiedBy = "empty";
	//game.squares[squareId].pieceId = "";
	gameView.removePiece(pieceId);
	
}

game.deActivateAllSquares = function() {
	$('.square').off("click");
}

game.getToggledPlayerTurn = function(player) {
	if (player === "pOne") {
		return "pTwo";
	} else {
		return "pOne";
	}
}

game.isValidMove = function(col,row,board) {
	if (board[col][row] !== "empty") {
		return false;
	}
	
	var newRow = squares.findEmptyRow(col,board);
	if (newRow !== row) {
		return false;
	}
	return true;
}

game.updateState = function(state) {
	game.state = state;
}

game.getScore = function(state) {
	var score = 0;
	var numOfConnections = 0;
	var numOfOpenConnections = 0;
    if (state.status !== "running") {
        if (state.result === "pOne wins") {
            score = 1000 - state.numOfMoves;
        }
        else if (state.result === "pTwo wins") {
            score = -1000 + state.numOfMoves;
        }
        else {
            score = 0;
        }
/*    } else {
    	if (state.playerTurn === "pOne") {
    		numOfConnections = squares.getNumOfConnections("pOne",state.board); 
    		numOfOpenConnections = squares.getNumOfOpenConnections("pOne",state.board);
    		
    		score = (numOfConnections * 1) + numOfOpenConnections;
    	} else {
    		numOfConnections = squares.getNumOfConnections("pTwo",state.board);
    		numOfOpenConnections = squares.getNumOfOpenConnections("pTwo",state.board);
    		score = (numOfConnections * 1) + numOfOpenConnections;
    		if (score) {
    			score = score * -1;
    		}
    	}*/
    }
    return score;
}

game.disableColumn = function(col) {
	var arrowId = "#arrow_" + col;
	
	$(arrowId).off("click");
	$("div[id^='s"+col+"']").off("click");
	gameView.hideArrow(arrowId);
	game.state.disabledCols.push(col);
}

game.disableAllColumns = function() {
	$("div[id^='arrow']").off("click");
	$(".square").off("click");
	gameView.hideAllArrows();
}

game.getPlayerFromPieceId = function(id) {
	var player = id.match(/^(.*?)\-/)[1];
	return player;
}

game.checkForWin = function(player) {

	var opp = game.getToggledPlayerTurn(player);
	
	if (game.state[opp+"PiecesNum"] === 0) {
		return player;
	}
	
	return false;
}

game.checkForDraw = function(board) {
	for(var col = 0;col<game.cols;col++){
		for(var row = 0;row<game.rows;row++){
			if (board[col][row] === "empty") {
				return false;
			}
		}
	}
	return true;
}

game.getMinimaxVal = function(state) {
	if (state.isTerminal() || state.miniMaxDepth > game.ai.level) {
		return game.getScore(state);
	}
	
	//console.log("board:");
	//console.log(state.board);
	//console.log("depth: " + state.miniMaxDepth);
	//console.log("score: " + game.getScore(state));
	
	var stateScore;
	
	if (state.playerTurn === "pOne") {
		stateScore = -1000;
	} else {
		stateScore = 1000;
	}
	
	var availableMoves = state.availableMoves();
	
	var availableNextStates = availableMoves.map(function(move) {
        
        //create a new state in which we will add the new piece into
        var nextState = new State(state);
		
		//adding the new piece to the new state
		nextState.board = squares.addPiece(move.newSquare,move.pieceId,nextState.board);
		nextState.board = squares.removePiece(move.currentSquare,nextState.board);
		nextState.numOfMoves++;
		nextState.changeTurn();
		nextState.miniMaxDepth++;
		
		return nextState;
	});
	
	availableNextStates.forEach(function(nextState) {
		
		var nextScore = game.getMinimaxVal(nextState); //recursive call

		if (state.playerTurn === "pOne") {
			if (nextScore > stateScore) {
				stateScore = nextScore;
			}
		} else {
			if (nextScore < stateScore) {
				stateScore = nextScore;
			}
		}
	});
	return stateScore;
}

game.resetGame = function(level) {
	gameView.removeBoard();
	gameView.renderBoard();
	gameView.addOpacity();
	gameView.hideWinnerBox();
	startScreenView.buildStartScreen(level);
	startScreenView.showStartScreen();
	startScreen.unBindClicks();
	startScreen.bindClicks(level);
}

game.activateContBtns = function() {
	$('#nextLevel').on("click", function(event) {
		console.log("continue");
		game.ai.level++;
		game.resetGame(game.ai.level);
	});
	$('#rematch').on("click", function(event) {
		console.log("rematch");
		game.resetGame(game.ai.level);
	});
}

game.deactivateContBtns = function() {
	$('#nextLevel').off("click");
	$('#rematch').off("click");
}

game.activateArrows = function() {
	$('.arrow').click(function() {
		var col = $(this).attr('id').match(/^arrow_(.*?)$/);
		col = col[1];
		$(document).trigger("playerMakesMove", col);
	});
	$('.square').click(function() {
		var col = $(this).attr('id').match(/^s(.*?)_/);
		col = col[1];
		$(document).trigger("playerMakesMove", col);
	});
}

game.deActivateArrows = function() {
	$('.arrow').off("click");
	$('.square').off("click");
}

game.updateWinnerBox = function(result) {
	var text;
	var nextBtn;
	
	if (result === "pOne wins") {
		text = "You Win!";
		nextBtn = 'Continue';
	} else if (result === "pTwo wins") {
		text = "You Lose!";
		nextBtn = 'Rematch';
	} else {
		text = "Draw Game!";
		nextBtn = "Rematch";
	}
	gameView.addWinnerText(text,nextBtn);
	//$('#mainWindow').prepend('<div class="winnerBox"><div class="pName">' + playerText + '</div>'+nextBtn+'</div>');
}