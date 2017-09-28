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
		_this.players = "one";
		_this.state = new State(undefined,level);
		_this.ai = new AI(level);
		_this.availableMoves = new Array();
		_this.moveDirections = {pOne: ['nw', 'ne'],
								pTwo: ['sw', 'se']
								};
		_this.kingDirections = ['nw', 'ne', 'se', 'sw'];						
		
		gameView.removeOpacity('board');
		gameView.removeOpacity('player_boxes');
		game.addPieces(game.state.board);
		startScreenView.hideMainMenu();
		
		$('#reset').on("click",function(){
			game.resetGame(level);
			game.init(level);
		});
		
		console.log("starting a game at level " + level);
		
		$('#main_menu').on("click",function() {
			gameView.addOpacity('board');
			gameView.addOpacity('player_boxes');
			$('.cancel').css({"display":"block"});
			startScreen.bindMenuClicks();
			startScreenView.showMainMenu();
		});
		
		gameView.showplayer(game.state.player);

		//allowing dragging of current player's pieces
		$('.'+game.state.player).draggable({disabled:false, revert: true, revertDuration: 10, zIndex:2, containment: "#board", scroll: false});
		
		//disable dragging of opponent's pieces
		$('.'+game.getToggledplayer(game.state.player)).draggable({disabled:true});
		$(document).trigger("playerMove", game.state.player);
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
			var player = game.getPlayerFromPieceId(pieceId);
			var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
			var square = {col:squares.getCol(this.id),
						  row:squares.getRow(this.id)
						  };  
			$(sqId).removeClass('accept');
			//Add Piece to the dom in the new square
			gameView.addPieceToSquare(pieceId,square);
			if ((player === "pOne" && square.row == 0) || (player === "pTwo" && square.row == Config.numRows - 1)) {
				if (!$('#'+pieceId).hasClass("king")) {
					$('#'+pieceId).addClass("king");
				}
			}
			//setTimeout(function(){ 		
				$(document).trigger("pieceDropped", [pieceId, square, game.state]);
			//},50); 
		},
		over: function(event, ui) {
			var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
			$(sqId).addClass('accept');
		},
		out: function(event, ui) {
			var width = $('#'+event.target.id).css("width");
			var sqId = '#s'+squares.getRow(this.id)+'_'+squares.getCol(this.id);
			$(sqId).removeClass('accept');
		}
	});
}

game.disableSquaresDroppable = function(moves) {
	for (var i=0; i<moves.length; i++) {
		var row = moves[i].nextSquare.row;
		var col = moves[i].nextSquare.col;
		$('#s'+row+'_'+col).droppable("disable");
	}
}

game.setPieceDraggable = function(pieceId,newSquare) {
	var newSqId = squares.getSquareId(newSquare);
    $('#'+pieceId).addClass(newSqId);
    $('#'+pieceId).addClass('active');
}

game.disablePieces = function() {
	for (var row = 0; row < Config.numRows;row++) {
		for (var col = 0; col < Config.numCols;col++){
			if (game.state.board[row][col] !== "null" || game.state.board[row][col] !== "empty") {
				var piece = game.state.board[row][col];
				$('#'+piece).removeClass(function (index, css) {
					return (css.match(/(s[0-9]_[0-9]\s?)/g) || []).join(' ');
				});
				$('#'+piece).removeClass('active');
			}
		}
	}
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

/*
idea is to pass in a piece and then receive an array (of arrays) of all the directions that jumps are available to that piece. (eg. [["ne","nw"],["ne","ne"]])

function takes in the piece, previous square, player, original state, new state



*/

game.getJumpsForPieceInSquare = function(pieceId,prevSquare,player,originalState,nextState,jumps) {
	console.log("start of function... board:");
	if (!jumps) {
		jumps = [];
	}
	
	if (!nextState) {
		var board = originalState.board;
		var dirs = game.moveDirections[originalState.player];
    		
		if (game.isPieceKing(pieceId,originalState)) {		
			dirs = dirs = game.kingDirections;
		}
	} else {
		var board = nextState.board;
		var dirs = game.moveDirections[nextState.player];
    		
		if (game.isPieceKing(pieceId,nextState)) {		
			dirs = dirs = game.kingDirections;
		}
	}
	game.printBoard(board);
	var opponent = game.getToggledplayer(player);
	//jumpsData["jumpedSquares"] = [];
	//jumpsData["jumpedDirs"] = [];
	//jumpsData["nextSquares"] = [];
	/*
	if (!nextJumps) {
		nextJumps = [];
	}
	*/
	var nextSquare;
	
	for (var i=0; i<dirs.length; i++) {
		if (nextSquare = squares.getNextSquareInDirection(prevSquare, dirs[i])) {
			if (board[nextSquare.row][nextSquare.col] !== "empty") {
				var pieceInSquareId = board[nextSquare.row][nextSquare.col];
				if (game.getPlayerFromPieceId(pieceInSquareId) === opponent) {
					if (game.isJumpable(nextSquare, dirs[i], player, board)) {
						console.log("jump found in direction: " + dirs[i]);
						jumps.push(dirs[i]);
						var jumpedSquare = nextSquare;
						nextSquare = squares.getNextSquareInDirection(jumpedSquare, dirs[i]);
						
						if (!nextState) {
							nextState = new State(originalState);
						} else {
							nextState = new State(nextState);
						}
						
						nextState.board = squares.addPiece(nextSquare,pieceId,nextState.board);
						nextState.board = squares.removePiece(prevSquare,nextState.board);
						nextState.board = squares.removePiece(jumpedSquare,nextState.board);
						
						//nextJumps = game.getJumpsForPieceInSquare(pieceId,nextSquare,player,originalState,nextState,jumps);
						game.getJumpsForPieceInSquare(pieceId,nextSquare,player,originalState,nextState,jumps);
						
						//if (!nextJumps || nextJumps.length === 0) {
						//	originalState.jumps.push(jumps);
						//}
						
						//jumpsData.jumpedSquares.unshift(jumpedSquare);
						//jumpsData.nextSquares.unshift(nextSquare);
						//jumpsData.jumpedDirs.unshift(dirs[i]);
					}
				}
			}
		}
	}				
	//console.log("end of function, board:");
	//game.printBoard(board);
	//console.log("returning: " + jumps);
	//return jumps;
	originalState.jumps.push(jumps);
}

game.getJumpsForPiece = function(pieceId,square,nextSquare,dir,player,board) {
	var data = {};
	var nextSquares = [];
	var nextDirs = [];
	var jumpedSquares = [];
	var opponent = game.getToggledplayer(player);
	
	var pieceIdInSquare = board[nextSquare.row][nextSquare.col];
	if (!game.getPlayerFromPieceId(pieceIdInSquare) === opponent) {
		return false;
	}
	
	while (game.isJumpable(nextSquare, dir, player, board)) {
		var jumpedSquare = nextSquare;
		nextSquare = squares.getNextSquareInDirection(nextSquare, dir);
		
		jumpedSquares.push(jumpedSquare);
		nextSquares.push(nextSquare);
		
		dirs = game.moveDirections[player];
		
		for (var i=0; i<dirs.length; i++) {
		
		}	
	}
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
    				if (nextSquare && board[nextSquare.row][nextSquare.col] === game.getToggledplayer(player)) {
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

game.removePieceFromState = function(jumpedPiece,square,state) {
	var squareId = squares.getSquareId(square);
	var pieceId = state.board[square.row][square.col];
	state.board[square.row][square.col] = "empty";
	game.pieces[pieceId] = '';
	gameView.removePiece(pieceId);
}

game.deActivateAllSquares = function() {
	$('.square').off("click");
}

game.getToggledplayer = function(player) {
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
	for (var i=0;i<state.kings.length;i++) {
		var piecePlayer = game.getPlayerFromPieceId(state.kings[i]);
		if (piecePlayer === player) {
			num++;
		}
	}
	return num;
}

game.isPieceKing = function(pieceId,state) {
	if ($.inArray(pieceId, state.kings) === -1) {
		return false;
	} else {
		return true;
	}
}

game.removeKingFromState = function(pieceId,state) {
	state.kings.splice($.inArray(pieceId, state.kings), 1);
	return state;
}

game.checkForWin = function(state) {

	if (state.player === "pOne") {
		if (state.getAvailableMoves(state).length === 0) {
			return "pTwo";
		}
	} else {
		if (state.getAvailableMoves(state).length === 0) {
			return "pOne";
		}
	}	

	if (state.pOnePiecesNum === 0) {
		return "pTwo";
	} else if (state.pTwoPiecesNum === 0) {
		return "pOne";
	} else {
		return false;
	}
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
	console.log("game.getScore");
	var score = 0;
	var piecesLeft = 0;
	var pieceDiff = 0;
	var pOneKings = 0;
	var pTwoKings = 0;
	var kingDiff = 0;
	var jumps = 0;
	var player = state.player;
	
    if (state.status !== "running") {
        if (state.result === "pOne wins") {
            score = 1000 - state.numOfMoves;
        }
        else if (state.result === "pTwo wins") {
            score = -1000 + state.numOfMoves;
        }
    }
	else {
		pieceDiff = state.pOnePiecesNum - state.pTwoPiecesNum;
		pOneKings = game.getNumOfKings("pOne",state);
		pTwoKings = game.getNumOfKings("pTwo",state);
		kingDiff = pOneKings - pTwoKings;
		if (state.availableJumps.length > 0) {
			jumps = state.availableJumps.length;
			console.log("this state has " + jumps + " jumps");
		}
		console.log("pOnePieces: " + state.pOnePiecesNum + " pTwoPieces: " + state.pTwoPiecesNum);
		console.log("pieceDiff: " + pieceDiff + ", kingDiff: " + kingDiff);
		score = (pieceDiff * 5) + (kingDiff * 3) + (jumps * 2);
	}
	console.log("score: " + score);
    return score;
}

game.getMinimaxVal = function(state) {
	console.log("*************");
	console.log("getMinimaxVal");
	console.log(state);
	console.log("depth: " + state.miniMaxDepth + ", player " + state.player);
	if (state.isEndState() || state.miniMaxDepth > game.ai.level) {
		console.log("Depth limit reached, returning score");
		game.printBoard(state.board);
		return game.getScore(state);
	}
	
	
	
	//console.log(state);
	game.printBoard(state.board);
	
	var stateScore = 0;
	
	if (state.player === "pOne") {
		stateScore = -1000;
	} else {
		stateScore = 1000;
	}
	
	var moves = state.getAvailableMoves();
	
	console.log("creating children states with moves applied");
	var states = moves.map(function(move) {
        console.log("move: ", move);
        
        //create a copy of the state passed in in which we will add the new piece to
        var nextState = new State(state);
        
		//adding the new piece to the new state
		nextState.board = squares.addPiece(move.nextSquare,move.pieceId,nextState.board);
		
		//removing the piece from its previous square
		nextState.board = squares.removePiece(move.currentSquare,nextState.board);
		
		//Check for Kinging
		if ((state.player === "pOne" && move.nextSquare.row == 0) || (state.player === "pTwo" && move.nextSquare.row == Config.numRows - 1)) {
			if (!game.isPieceKing(move.pieceId,nextState)) {
				nextState.kings.push(move.pieceId);
			}
		} 
		
		if (move.jumpedSquare) {
			if (Config.devmode) {
				console.log("...and a piece was jumped")
			}
			
			var jumpedPiece = nextState.board[move.jumpedSquare.row][move.jumpedSquare.col];
			nextState.board = squares.removePiece(move.jumpedSquare,nextState.board);
			nextState[game.getToggledplayer(nextState.player)+"PiecesNum"]--;
			if (Config.devmode) {
				console.log("Checking for more jumps...");
			}
			nextState.setAvailableJumps(move.pieceId,move.nextSquare);
			if (nextState.availableJumps.length === 0) {
				console.log("changing turn");
				nextState.changeTurn();
				nextState.miniMaxDepth++;
			}
		} else {
			console.log("changing turn");
			nextState.changeTurn();
			nextState.miniMaxDepth++;
			nextState.setAvailableMoves();
			nextState.setAvailableJumps();
		}
		nextState.numOfMoves++;
		
		return nextState;
	});
	
	states.forEach(function(stateTmp) {
		console.log("scoring stateTmp ", stateTmp);
		var nextScore = game.getMinimaxVal(stateTmp); //recursive call
		console.log("player: " + state.player + ", nextScore: " + nextScore);
		console.log("current stateScore: " + stateScore);
		if (state.player === "pOne") {
			if (nextScore > stateScore) {
				stateScore = nextScore;
			}
		} else {
			if (nextScore < stateScore) {
				stateScore = nextScore;
			}
		}
		console.log("new stateScore: " + stateScore);
	});
	console.log("at end of minimax function...");
	console.log("player: " + state.player + ", depth: " + state.miniMaxDepth);
	game.printBoard(state.board);
	console.log("minimax function returning stateScore: " + stateScore);
	return stateScore;
}

game.resetGame = function() {
	gameView.removeBoard();
	gameView.removeAllPieces();
	gameView.renderBoard();
	gameView.hideWinnerBox();
	startScreen.unBindClicks();
	startScreen.bindMenuClicks();
}

game.activateContBtns = function() {
	var level;
	$('#nextLevel').on("click", function(event) {
		console.log("continue");
		if (game.ai.level == 1) {
			level = 2;
		} else {
			level = 4;
		}
		game.resetGame(level);
		game.init(level);
	});
	$('#rematch').on("click", function(event) {
		console.log("rematch");
		game.resetGame(game.ai.level);
		game.init(game.ai.level);
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
		if (game.ai.level === 4) {
			nextBtn = 'Rematch';
		} else {
			nextBtn = 'Continue';
		}
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
	var val;
	var blank = "        |        |        |        |        |        |        |        |";
	var underline = "________|________|________|________|________|________|________|________|";
	for (var row = 0; row < Config.numRows;row++) {
		var colString = '';
    	for (var col = 0; col < Config.numCols;col++) {
    		val = board[row][col];
    		if (val === "null") {
    			val = "        ";
    		} else if (val === "empty") {
    			val = " ------ ";
    		} else {
    			val = ' ' + val;
    			var len = val.length;
    			var num = 8 - len;
    			for (var i=0;i<num;i++) {
    				val = val + ' ';
    			}
    		}
    		colString += val + "|";
    	}
    	console.log(blank);
    	console.log(colString);
    	console.log(underline);
    }
}