var State = function(state) {

	if (typeof state !== "undefined") {
		this.board = game.buildBoard(state.board);
		this.playerTurn = state.playerTurn;
		this.numOfMoves = state.numOfMoves;
		this.status = state.status;
		this.pOnePiecesNum = state.pOnePiecesNum;
		this.pTwoPiecesNum = state.pTwoPiecesNum;
		this.result = state.result;
		this.jumps = state.jumps;
		this.miniMaxDepth = state.miniMaxDepth;
		this.availableMoves = state.availableMoves;
		this.kings = state.kings;
	} else {
		var tmpBoard;
		/*
		var tmpBoard = [
		["null", "pTwo1", "null", "pTwo2", "null", "pTwo3", "null", "pTwo4"],
		["empty", "null", "pTwo6", "null", "pTwo7", "null", "pTwo8", "null"],
		["null", "pTwo5", "null", "empty", "null", "empty", "null", "pTwo12"],
		["pTwo10", "null", "pTwo9", "null", "empty", "null", "pTwo11", "null"],
		["null", "empty", "null", "pOne11", "null", "empty", "null", "empty"],
		["empty", "null", "pOne12", "null", "empty", "null", "pOne9", "null"],
		["null", "pOne3", "null", "pOne2", "null", "pOne6", "null", "pOne5"],
		["pOne4", "null", "empty", "null", "empty", "null", "pOne1", "null"]
		];
		*/ 
		this.board = game.buildBoard(tmpBoard);
		this.playerTurn = "pOne";
		this.numOfMoves = 0;
		this.status = "running";
		this.pOnePiecesNum = Config.numPlayerPieces;
		this.pTwoPiecesNum = Config.numPlayerPieces;
		this.result = "";
		this.jumps = [];
		this.miniMaxDepth = 1;
		this.availableMoves = new Array();
		this.kings = new Array();
	}
	
	this.changeTurn = function() {
		this.playerTurn = game.getToggledPlayerTurn(this.playerTurn);
	}

	this.setAvailableMoves = function(jumpingPieceId,currentSquare) {
		var player = this.playerTurn;
		var board = this.board;
		var nextSquare;
		var dirs;
		var pieceId;
		var moves = [];
		var jumps = [];
		//console.log(playerPieces);
		
		if (jumpingPieceId,currentSquare) {
			var col = currentSquare.col;
			var row = currentSquare.row;
			
			dirs = game.moveDirections[this.playerTurn];
    				
			if (jQuery.inArray(pieceId, this.kings) !== -1) {
				dirs = dirs = game.kingDirections;
			}
			
			for (var i=0; i<dirs.length; i++) {
				if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
					if (board[nextSquare.row][nextSquare.col] !== "empty") {
						var pieceInSquareId = board[nextSquare.row][nextSquare.col];
						var pieceInSquareId = board[nextSquare.row][nextSquare.col];
						if (game.getPlayerFromPieceId(pieceInSquareId) === game.getToggledPlayerTurn(player)) {
							if (game.isJumpable(nextSquare, dirs[i], player, board)) {
								var jumpedSquare = nextSquare;
								nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
								
								var move = new Move(jumpingPiece, currentSquare, nextSquare, jumpedSquare, dirs[i], player);
								jumps.push(move);
							}
						}
					}
				}
			}
		} else {
			for (var row = 0; row < Config.numRows;row++) {
    			for (var col = 0; col < Config.numCols;col++) {
    				var pieceId = board[row][col];
    				if (game.getPlayerFromPieceId(pieceId) !== player) {
    					continue;
    				}
    				
    				var currentSquare = {row:row,col:col};
    				dirs = game.moveDirections[this.playerTurn];
    				
    				if (jQuery.inArray(pieceId, this.kings) !== -1) {
    					dirs = dirs = game.kingDirections;
    				}
    				
    				for (var i=0; i<dirs.length; i++) {
						if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
							if (board[nextSquare.row][nextSquare.col] === "empty") {
								var move = new Move(pieceId, currentSquare, nextSquare, '', dirs[i], player);
								moves.push(move);
							} else {
								var pieceInSquareId = board[nextSquare.row][nextSquare.col];
								if (game.getPlayerFromPieceId(pieceInSquareId) === game.getToggledPlayerTurn(player)) {
									if (game.isJumpable(nextSquare, dirs[i], player, board)) {
										var jumpedSquare = nextSquare;
										nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
										
										var move = new Move(pieceId, currentSquare, nextSquare, jumpedSquare, dirs[i], player);
										jumps.push(move);
									}
								}
							}
						}
					}
    			}
    		}
		}
		if (jumps.length > 0) {
			if (Config.devmode) {
				//console.log("Jumps available!");
			}
			this.jumps = true;
			this.availableMoves = jumps;
		} else {
			this.jumps = false;
			this.availableMoves = moves;
		}
}
	
	this.isEndState = function() {
		var winner = game.checkForWin(this.playerTurn);
		if (winner) {
			this.result = winner + " wins";
			this.status = "ended";
			this.winner = winner;
			return true;
		} else {
			return false;
		}
	}
}