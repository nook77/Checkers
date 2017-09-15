var State = function(state) {

	if (typeof state !== "undefined") {
		this.board = game.buildBoard(state.board);
		this.playerTurn = state.playerTurn;
		this.numOfMoves = state.numOfMoves;
		this.status = state.status;
		this.pOnePiecesNum = state.pOnePiecesNum;
		this.pTwoPiecesNum = state.pTwoPiecesNum;
		this.result = state.result;
		this.jumpingPiece = state.jumpingPiece;
		this.jumps = state.jumps;
		this.miniMaxDepth = state.miniMaxDepth;
	} else {
		this.board = game.buildBoard();
		this.playerTurn = "pOne";
		this.numOfMoves = 0;
		this.status = "running";
		this.pOnePiecesNum = Config.numPlayerPieces;
		this.pTwoPiecesNum = Config.numPlayerPieces;
		this.result = "";
		this.jumpingPiece = "";
		this.jumps = [];
		this.miniMaxDepth = 1;
	}
	
	this.changeTurn = function() {
		this.playerTurn = game.getToggledPlayerTurn(this.playerTurn);
	}
	/*
	this.availableMoves = function() {
		var moves = new Array();
		for (i = 0;i<game.cols;i++) {
			for (j = 0;j<game.rows;j++) {
				if (this.board[i][j] === "empty") {
					if (game.isValidMove(i,j,this.board)) {
						moves.push({col: i,row: j});
					}
				}
			}
		}
		return moves;
	}
	*/
	this.availableMoves = function() {
		var player = this.playerTurn;
		var board = this.board;
		
		var pieceId;
		var moves = [];
		var jumps = [];
		//console.log(playerPieces);
		
		if (this.jumpingPiece) {
			var piece = game.pieces[this.jumpingPiece];
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
								
								var move = new Move(this.jumpingPiece, currentSquare, nextSquare, jumpedSquare, dirs[i], player);
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
							var move = new Move(pieceId, currentSquare, nextSquare, '', dirs[i], player);
							moves.push(move);
						} else {
							var pieceInSquareId = board[nextSquare.col][nextSquare.row];
							var pieceInSquare = game.pieces[pieceInSquareId];
							if (pieceInSquare.player === game.getToggledPlayerTurn(player)) {
								if (game.isJumpable(nextSquare, dirs[i], player, board)) {
									var jumpedSquare = nextSquare;
									nextSquare = squares.getNextSquareInDirection(nextSquare, dirs[i]);
									
									var move = new Move(pieceId, currentSquare, nextSquare, jumpedSquare, dirs[i], player);
									jumps.push(move);
									this.jumpingPiece = pieceId;
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
	
	this.isTerminal = function() {
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