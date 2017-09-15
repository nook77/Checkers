var Move = function(pieceId, currentSquare, newSquare, jumpedSquare, direction, player) {
	this.pieceId = pieceId;
	this.currentSquare = currentSquare;
	this.newSquare = newSquare;
	this.jumpedSquare = jumpedSquare;
	this.direction = direction;
	this.player = player;
	this.nextState;
}