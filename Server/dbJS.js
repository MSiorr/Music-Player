
DBManager = {
    canAdd: function(base, data){
        return new Promise ((resolv, resync) => {
            let status = null
            base.find({ name: data.name }, (err, docs) => {
                if(docs.length > 0){
                    docs.forEach( e => {
                        if(e.origin == data.origin){
                            status = false
                        }
                    })
                    if(status == null){
                        status = true
                    }
                } else {
                    status =  true
                }
                resolv(status) 
            });
        })
    },

    addToBase: function(base,data){
        base.insert(data, function(err, newDoc){
            console.log("dodano");
        })
    },

    delFromBase: function(base, data){
        status = null;
        return new Promise ((resolv, resync) => {
            base.remove({ album: data.album, name: data.name, size: data.size, origin: data.origin }, {}, (err, numRemoved) => {
                if(numRemoved > 0){
                    status = true;
                } else {
                    status = false;
                }
                resolv(status)
            });
        })
    },

    getPlaylist: function(base){
        return new Promise ((resolv, resync) => {
            base.find({}, (err, docs) => {
                resolv(docs) 
            });
        })
    }
}


module.exports = DBManager