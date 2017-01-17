// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
RTSession.onPlayerConnect(function(player){

    var playerPeerId = player.getPeerId(); // gets sender's peerID
    var playerPlayerId = player.getPlayerId(); // gets sender's playerID
});


RTSession.onPlayerDisconnect(function(player){

    var playerPeerId = player.getPeerId(); // gets sender's peerID
    var playerPlayerId = player.getPlayerId(); // gets sender's playerID
});


RTSession.onPacket(100, function(packet){
    var senderPeerId = packet.getSender().getPeerId(); // get sender's peerID
    var senderPlayerId = packet.getSender().getPlayerId(); // get sender's playerID

    if(packet.getTargetPlayers().length > 0){
        for(var i = 0; packet.getTargetPlayers().length; i++){
            var targetPeerID = packet.getTargetPlayers()[i];
        }
    }else{
        // if the target-player list is empty then the packet is to being sent to everyone so //
    }
});