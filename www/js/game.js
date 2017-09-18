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
		//_this.pieces = new Object();
		_this.players = "one";
		_this.state = new State(undefined,level);
		_this.ai = new AI(level);
		_this.availableMoves = new Array();
		_this.moveDirections = {pOne: ['nw', 'ne'],
								pTwo: ['sw', 'se']
								};
		_this.kingDirections = ['nw', 'ne', 'se', 'sw'];						
		
		gameView.removeOpacity();
		//game.setAllSquaresDroppable(game.state.board);
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
		//console.log("buildBoard");
	}
	var player = "pTwo";
	var newBoard = [];
	count = 1;
	for (var row = 0; row < Config.numRows;row++) {
		newBoard[row] = new Array();
    	for (var col = 0; col < Config.numCols;col++) {
    		if ((col + row) % 2 !== 0) {
    			if (row > 2 && row < 5)  {
					newBoard[row][col] = "empty";
				} else {
					newBoard[row][col] = player + count;
					count++;
				}
				
				if (row === 3) {
					player = "pOne";
					count = 1;
				}
				
				if (typeof board !== "undefined") {
					newBoard[row][col] = board[row][col];
				}
			} else {
				newBoard[row][col] = "null";
			}
		}
    }	
	return newBoard;
}


game.addPieces = function(board) {
	if (Config.devmode) {
		console.log("addPieces");
	}
	var count = 1;
	for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++){
			//if (board[row][col] === "empty") {
			var pieceId = board[row][col];
			if (pieceId === "null" || pieceId === "empty") {
				continue;
			}
			var player = pieceId.match(/(pOne|pTwo)/)[1]
			var count = pieceId.match(/(pOne|pTwo)([0-9]{1,})/)[2];
			gameView.renderPiece(col, row, player, count);
			//var piece = new Piece(player + count, {col:col,row:row}, player, game.moveDirections[player]);
			
			//game.pieces[player + count] = piece;
			count++;
		}
    }
}


game.setAllSquaresDroppable = function(board) {
	for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++){
			if (board[row][col] === "empty") {
				//Setting the square as droppable. 
				$('#s'+row+'_'+col).droppable({
					//It will only accept pieces that have a class matching the squares ID.
					accept: '.s'+row+'_'+col,
					drop: function(event, ui) {
						var pieceId = ui.draggable[0].id;
						var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
						var square = {row:squares.getRow(this.id),
									  col:squares.getCol(this.id)
									  };  
						var top = parseInt($(sqId).css("top")) + 6 + "px";
						var left = parseInt($(sqId).css("left")) + 6 + "px";
						$(sqId).css({"border-color":"black","width":"73px","height":"73px","top":top,"left":left});     		
						$(document).trigger("pieceDropped", [pieceId, square, game.state]);
					},
					over: function(event, ui) {
						var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
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
						var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
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

game.disableAllSquaresDroppable = function(board) {
	for (var row = 0; row < Config.numRows;row++) {
		for (var col = 0; col < Config.numCols;col++){
			if (board[row][col] !== "null") {
				$('#s'+row+'_'+col).droppable("disable");
			}
		}
	}
}

game.setSquareDroppable = function(square) {
	var row = square.row;
	var col = square.col;
	var sqId = '#s'+row+'_'+col;
	if ($(sqId).droppable()) {
	if ($(sqId).droppable("option","disabled")) {
		$(sqId).droppable('enable');
	}
	}
	$(sqId).droppable({
		//It will only accept pieces that have a class matching the squares ID.
		accept: '.s'+row+'_'+col,
		drop: function(event, ui) {
			var pieceId = ui.draggable[0].id;
			var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
			var square = {col:squares.getCol(this.id),
						  row:squares.getRow(this.id)
						  };  
			var top = parseInt($(sqId).css("top")) + 6 + "px";
			var left = parseInt($(sqId).css("left")) + 6 + "px";
			$(sqId).css({"border-color":"black","width":"73px","height":"73px","top":top,"left":left});
			
			//Add Piece to the dom in the new square
			gameView.addPieceToSquare(pieceId,square);  
			setTimeout(function(){ 		
				$(document).trigger("pieceDropped", [pieceId, square, game.state]);
			},10); 
		},
		over: function(event, ui) {
			var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
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
			var width = $('#'+event.target.id).css("width");
			if (width !== "73px") {
				var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
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
		}
	});
}

game.disableSquaresDroppable = function(moves) {
	for (var i=0; i<moves.length; i++) {
		var row = moves[i].newSquare.row;
		var col = moves[i].newSquare.col;
		$('#s'+row+'_'+col).droppable("disable");
	}
}

game.setPieceDraggable = function(pieceId,newSquare) {
	var newSqId = squares.getSquareId(newSquare);
    $('#'+pieceId).addClass(newSqId);
}

game.disablePieces = function() {
	for (piece in game.pieces) {
		$('#'+piece).removeClass (function (index, css) {
    		return (css.match(/(s[0-9]_[0-9]\s?)/g) || []).join(' ');
		});
	}
}

game.activateAvailableSquares = function(moves) {
	for (var i=0; i<moves.length; i++) {
		var newSqId = squares.getSquareId(moves[i].newSquare);
		$('#'+moves[i].pieceId).addClass(newSqId);
	}
}
/*
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
				if (board[nextSquare.row][nextSquare.col] !== "empty") {
					var pieceInSquareId = board[nextSquare.row][nextSquare.col];
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
					if (board[nextSquare.row][nextSquare.col] === "empty") {
						var move = new Move(pieceId, currentSquare, nextSquare, '', player);
						moves.push(move);
					} else {
						var pieceInSquareId = board[nextSquare.row][nextSquare.col];
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
*/

game.getSquareFromPieceId = function(pieceId,board) {
	for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++) {
    		if (board[row][col] === pieceId) {
    			break;
    		}
    	}
    	if (board[row][col] === pieceId) {
			break;
		}
    }
    return {row:row,col:col};
}
game.isJumpable = function(square, dir, currentPlayer, board) {

	var coords = {col: square.col, row: square.row};
	var nextSquare = squares.getNextSquareInDirection(coords, dir);
	if (!nextSquare) {
		return false;
	}
	
	if (board[nextSquare.row][nextSquare.col] !== "empty") {
		return false;
	}
	
	return true;
}

game.findJumps = function(player, board) {
	
	var dirs = game.moveDirections[player];
	var jumps = [];
	for (var row = 0; row < Config.numRows;row++) {
    	for (var col = 0; col < Config.numCols;col++) {	
    		if (board[row][col] === player) {
    			var coords = {row: row, col: col};
    			for (var i=0; i<dirs.length; i++) {
    				var nextSquare = squares.getNextSquareInDirection(coords, dirs[i]);
    				if (nextSquare && board[nextSquare.row][nextSquare.col] === game.getToggledPlayerTurn(player)) {
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

game.removePieceFromSquare = function(square) {
	if (Config.devmode) {
		console.log("removePieceFromSquare ", square);
	}
	var squareId = squares.getSquareId(square);
	var pieceId = game.state.board[square.row][square.col];
	game.state.board[square.row][square.col] = "empty";
	game.pieces[pieceId] = '';
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
	if (board[row][col] !== "empty") {
		return false;
	}
	return true;
}

game.updateState = function(state) {
	game.state = state;
}

game.getPlayerFromPieceId = function(id) {
	if (id === "null" || id === "empty") {
		return false;
	}
	
	var player = id.match(/^(.*?)[0-9]/)[1];
	return player;
}

game.getNumOfKings = function(player,state) {
	var num=0;
	for (var king in state.kings) {
		var piecePlayer = game.getPlayerFromPieceId(king);
		if (piecePlayer === player) {
			num++;
		}
	}
	return num;
}

game.checkForWin = function(player) {

	var opp = game.getToggledPlayerTurn(player);
	
	if (game.state[opp+"PiecesNum"] === 0) {
		return player;
	}
	
	return false;
}

game.checkForDraw = function(board) {
	for(var row = 0;row<game.rows;row++){
		for(var col = 0;col<game.cols;col++){
			if (board[row][col] === "empty") {
				return false;
			}
		}
	}
	return true;
}

game.getScore = function(state) {
	//console.log("game.getScore");
	var score = 0;
	var piecesLeft = 0;
	var pieceDiff = 0;
	var kings = 0;
	var jumps = 0;
	var player = state.playerTurn;
	
    if (state.status !== "running") {
        if (state.result === "pOne wins") {
            score = 100 - state.numOfMoves;
        }
        else if (state.result === "pTwo wins") {
            score = -100 + state.numOfMoves;
        }
    }
	else {
		pieceDiff = state.pOnePiecesNum - state.pTwoPiecesNum;
		kings = game.getNumOfKings(player,state);
		console.log("pieceDiff: " + pieceDiff + ", kings: " + kings);
		score = pieceDiff + (kings * 2);
		if (player === "pTwo") {
			score = score * -1;
		}
	}
	console.log("score: " + score);
    return score;
}

game.getMinimaxVal = function(state) {
	if (state.isEndState() || state.miniMaxDepth > game.ai.level) {
		console.log("Depth limit reached, returning score");
		game.printBoard(state.board);
		return game.getScore(state);
	}
	
	console.log("getMinimaxVal");
	console.log("depth: " + state.miniMaxDepth);
	console.log(state);
	game.printBoard(state.board);
	
	var stateScore;
	
	if (state.playerTurn === "pOne") {
		stateScore = -1000;
	} else {
		stateScore = 1000;
	}
	
	var states = state.availableMoves.map(function(move) {
        //console.log("move: ", move);
        
        //create a copy of the state passed in in which we will add the new piece to
        var nextState = new State(state);
		
		//adding the new piece to the new state
		nextState.board = squares.addPiece(move.newSquare,move.pieceId,nextState.board);
		
		//removing the piece from its previous square
		nextState.board = squares.removePiece(move.currentSquare,nextState.board);
		
		if (move.jumpedSquare) {
			if (Config.devmode) {
				console.log("...and a piece was jumped")
			}
			
			var jumpedPiece = nextState.board[move.jumpedSquare.row][move.jumpedSquare.col];
			nextState.board = squares.removePiece(move.jumpedSquare,nextState.board);
			nextState[game.getToggledPlayerTurn(nextState.player)+"PiecesNum"]--;
			if (Config.devmode) {
				console.log("Checking for more jumps...");
			}
			
			nextState.setAvailableMoves(move.pieceId);
			if (nextState.availableMoves.length === 0) {
				nextState.changeTurn();
			}
		} else {
			nextState.changeTurn();
			nextState.setAvailableMoves();
		}
		nextState.numOfMoves++;
		nextState.miniMaxDepth++;
		return nextState;
	});
	
	states.forEach(function(state) {
		var nextScore = game.getMinimaxVal(state); //recursive call
		
		if (state.playerTurn === "pOne") {
			if (nextScore > stateScore) {
				stateScore = nextScore;
			}
		} else {
			if (nextScore < stateScore) {
				stateScore = nextScore;
			}
		}
		console.log("stateScore: " + stateScore);
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

game.printBoard = function(board) {
	for (var row = 0; row < Config.numRows;row++) {
		var colString = '';
    	for (var col = 0; col < Config.numCols;col++) {
    		colString += board[row][col] + " | ";
    	}
    	console.log(colString);
    }
}