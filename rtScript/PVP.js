var NORMAL_LEVEL = [25,28,29,30,32,33,34,35,36,37,38,45];

var playerCount = 0;
RTSession.onPlayerConnect(function(player){
    if(++playerCount == 2){
        RTSession.getLogger().debug("2 player deu join phong " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
        var data = RTSession.newData();
        var randomSeed = parseInt(Math.random() * 1000000);
        var level = NORMAL_LEVEL[parseInt(Math.random()* NORMAL_LEVEL.length)];
        data.setNumber(1, randomSeed);
        data.setNumber(2, parseInt(Math.random() * 99));
        var request = RTSession.newRequest()
        .createLogEventRequest()
        .setEventKey("OCR");
        request.setdata({"level":level,"get_level_data":true});
        request.setPlayerId(player.getPlayerId())
            .send(function(response){
                RTSession.getLogger().debug("Nhan duoc goi tin lay thong tin level " +level+" " + JSON.stringify(response.scriptData));
                if(response.scriptData.data){
                    data.setString(3, response.scriptData.data.data);
                }
                RTSession.newPacket().setReliable(true).setOpCode(100).setData(data).send();
            });
        
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
    RTSession.getLogger().debug("Bat dau tran dau " + startMapCount+ " time "+ new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
    startMapCount++;
    if(startMapCount == 1) return false;
    RTSession.newPacket().setOpCode(2).setReliable(true).send();
    return false;
});

var eatId = 1;
var eatStatus = {};
var lastPlayerEatPeerId;
var data_holder;
//Xu ly goi tin an va tranh chap
RTSession.onPacket(3, function(packet){
    var client_eat_id = packet.getData().getNumber(1);
    RTSession.getLogger().debug("Nhan duoc goi tin an eat id client " + client_eat_id + " server " + eatId + " time "  +  new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
    if(client_eat_id == eatId || client_eat_id == eatId -1){
        if(!eatStatus[client_eat_id+""]){// Chua co ai an id nay
            eatStatus[client_eat_id+""] = 1;
            lastPlayerEatPeerId = packet.getSender().getPeerId();
            var data_client = packet.getData();
            data_holder = RTSession.newData();
            data_holder.setNumber(1, client_eat_id);
            data_holder.setNumber(2, data_client.getNumber(2));
            data_holder.setNumber(3, data_client.getNumber(3));
            data_holder.setNumber(4, data_client.getNumber(4));
            data_holder.setNumber(5, data_client.getNumber(5));
            data_holder.setNumber(6, data_client.getNumber(6));
            data_holder.setNumber(7, data_client.getNumber(7));
            eatId = eatId + 1;
            RTSession.newPacket().setReliable(true).setOpCode(3).setSender(lastPlayerEatPeerId).setData(data_holder).send();
            return false;
        }else{ // Da duoc an id nay(goi tin thu 2 hoac la doi thu)
            if(lastPlayerEatPeerId != packet.getSender().getPeerId() && eatStatus[client_eat_id+""] == 1){//Co nguoi choi thu 2 an cung luc
                eatStatus[client_eat_id+""] =2;
                // var data = RTSession.newData();
                // data.setNumber(1, eatId);
                // RTSession.newPacket().setReliable(true).setOpCode(4).setSender(packet.getSender().getPeerId()).setTargetPeers(packet.getSender().getPeerId()).setData(data).send();
                return false;
            }
        }
    }else{
        RTSession.getLogger().error("Goi tin den bi sai id "+ new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
    }
    
    return false;
});


var num_end_score = 0;
var end_score = {};
//Nhan goi tin ket thuc van choi va gui thong tin ve cho nguoi choi
RTSession.onPacket(4, function(packet){
    var score = packet.getData().getNumber(1);
    RTSession.getLogger().debug("Nhan duoc goi tin ket thuc van choi score " + score +" player " + packet.getSender().getPeerId() + " date "  +  new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
    num_end_score++;
    end_score[packet.getSender().getPeerId() + ""] = score;
    if(num_end_score == 2){
        var data = RTSession.newData();
        for(var key in end_score){
            data.setNumber(parseInt(key), end_score[key]);    
        }
        RTSession.getLogger().debug("Gui goi tin ket thuc tran dau " + " date "  +  new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
        RTSession.newPacket().setReliable(true).setOpCode(4).setSender(packet.getSender().getPeerId()).setData(data).send();
    }else{
        return false;
    }
});