
function getTextTranslation(text,lang){
    var translateDB = Spark.runtimeCollection("translateMeta");
    var text_in_db = translateDB.findOne({"text_en":text});
    if(lang == "en"){
        return text;
    }else if(text_in_db && text_in_db["text_" + lang]){//Neu co thong tin dich roi trong db thi lay luon
        return text_in_db["text_" + lang];
    }else{
        var link = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyAB_2A88IPZzfgFQLfe16KM2SvyEofvj7M&source=en&target="+lang+"&q=" + text;
        link = encodeURI(link);
        var res = Spark.getHttp(link).get();//Lay phan dich tu google api
        var status = res.getResponseJson();
        if(status.error){
            return text;
        }else{
            var save_data = {"text_en":text};
            var lang_text_key = "text_" + lang;
            save_data[lang_text_key] = status.data.translations[0].translatedText;
            translateDB.update({"text_en":text},{"$set":save_data},true,false);//Luu thong tin lay duoc vao db
        }
        return status.data.translations[0].translatedText;
    }
    
    return text;
}

function getLangList(){
    var translateLangListDB = Spark.metaCollection("translateLangsMeta");
    var langs = translateLangListDB.find({}).toArray();
    if(langs.length == 0){
        var link = "https://translation.googleapis.com/language/translate/v2/languages?key=AIzaSyAB_2A88IPZzfgFQLfe16KM2SvyEofvj7M&target=en";
        var res = Spark.getHttp(link).get();//Lay phan dich tu google api
        var status = res.getResponseJson();
        if(!status.error){
            translateDB.insert(status.data.languages);//Luu thong tin lay duoc vao db
        }else{
            return [];
        }
    }
    return langs;
}
