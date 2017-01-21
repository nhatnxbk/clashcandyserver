// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm          
//
// ====================================================================================================
var playerCount = 0;
RTSession.onPlayerConnect(function(player){
    if(++playerCount == 2){
        RTSession.getLogger().debug("2 player deu join phong " + Date.now());
        var data = RTSession.newData();
        var randomSeed = parseInt(Math.random() * 1000000);
        data.setNumber(1, randomSeed);
        data.setNumber(2, 10);
        RTSession.newPacket().setReliable(true).setOpCode(100).setData(data).send();
    }
    var playerPeerId = player.getPeerId(); // gets sender's peerID
    var playerPlayerId = player.getPlayerId(); // gets sender's playerID
});


RTSession.onPlayerDisconnect(function(player){

    var playerPeerId = player.getPeerId(); // gets sender's peerID
    var playerPlayerId = player.getPlayerId(); // gets sender's playerID
});

// RTSession.onPacket(1, function(packet){
//     var senderPeerId = packet.getSender().getPeerId(); // get sender's peerID
//     var senderPlayerId = packet.getSender().getPlayerId(); // get sender's playerID

//     if(packet.getTargetPlayers().length > 0){
//         for(var i = 0; packet.getTargetPlayers().length; i++){
//             var targetPeerID = packet.getTargetPlayers()[i];
//         }
//     }else{
//         // RTSession.getLogger().debug("This Is A Debug Message..." + packet.getData());
//         // if the target-player list is empty then the packet is to being sent to everyone so //
//     }
// });

var startMapCount = 0;
//Nhan duoc goi tin muon bat dau tran dau tu host
RTSession.onPacket(2, function(packet){
    RTSession.getLogger().debug("Bat dau tran dau " + startMapCount+ Date.now());
    startMapCount++;
    if(startMapCount == 1) return false;
    RTSession.newPacket().setOpCode(2).send();
    return false;
});

var eatId = 1;
var eatStatus = {};
var lastPlayerEatPeerId;
//Xu ly goi tin an va tranh chap
RTSession.onPacket(3, function(packet){
    var client_eat_id = packet.getData().getNumber(1);
    RTSession.getLogger().debug("Nhan duoc goi tin an eat id client " + client_eat_id + " server " + eatId +" "  +  Date.now());
    if(client_eat_id == eatId){
        if(!eatStatus[eatId+""]){// Chua co ai an id nay
            eatStatus[eatId+""] = 1;
            lastPlayerEatPeerId = packet.getSender().getPeerId();
            var data = RTSession.newData();
            data.setNumber(1, client_eat_id);
            eatId = eatId + 1;
            RTSession.newPacket().setReliable(true).setOpCode(3).setSender(packet.getSender().getPeerId()).setTargetPeers(packet.getSender().getPeerId()).setData(data).send();
            RTSession.newPacket().setReliable(false).setOpCode(3).setSender(packet.getSender().getPeerId()).setTargetPeers(packet.getSender().getPeerId()).setData(data).send();
            return packet;
        }else{ // Da duoc an id nay(goi tin thu 2 hoac la doi thu)
            if(lastPlayerEatPeerId != packet.getSender().getPeerId() && eatStatus[eatId+""] == 1){//Co nguoi choi thu 2 an cung luc
                eatStatus[eatId+""] =2;
                // var data = RTSession.newData();
                // data.setNumber(1, eatId);
                // RTSession.newPacket().setReliable(true).setOpCode(4).setSender(packet.getSender().getPeerId()).setTargetPeers(packet.getSender().getPeerId()).setData(data).send();
                return false;
            }
        }
    }else{
        RTSession.getLogger().error("Goi tin den bi sai id "+ Date.now());
    }
    
    return false;
});