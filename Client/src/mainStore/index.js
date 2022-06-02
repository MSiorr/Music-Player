import axios from 'axios'
import Vuex from "vuex"
import Vue from "vue"

Vue.use(Vuex);

// state
const state = {
    location: "mp3",
    dataList: [],
    currentAlbumName: "",
    currentPlayedAlbumName: "",
    playStatus: {status: false, id: null},
    musicTime: 0,
    musicMaxTime: 0,
    musicTimeStr: "00:00",
    musicMaxTimeStr: "00:00",
    progressBarWidth: 0,
    volume: 0.1,
    loopStatus: false,
    randomStatus: false
}

// getters
const getters = {
    getLocation: function(state){
        return state.location;
    },
    getData: function(state){
        return state.dataList;
    },
    getAlbumName: function(state){
        return state.currentAlbumName;
    },
    getPlayedAlbumName: function(state){
        return state.currentPlayedAlbumName;
    },
    getPlayStatus: function(state){
        return state.playStatus;
    },
    getMusicTimeStr: function(state){
        return state.musicTimeStr;
    },
    getMusicMaxTimeStr: function(state){
        return state.musicMaxTimeStr;
    },
    getProgressBarWidth: function(state){
        return state.progressBarWidth;
    },
    getLoopStatus: function(state){
        return state.loopStatus;
    },
    getRandomStatus: function(state){
        return state.randomStatus;
    }
}

// actions
const actions = {
    getMusicList({ commit }){
        axios.post('http://localhost:3000/getData', JSON.stringify({action: "First"}))
            .then(response => {
                commit('LOCATION_MUTATION', "mp3");
                commit('SERVERDATA_MUTATION', response.data)
                commit('CURRENTALBUM_MUTATION', response.data.dirs[0])
            })
    },
    getSpecificAlbum({ commit }, dataPayload){
        axios.post('http://localhost:3000/getData', JSON.stringify(dataPayload))
            .then(response => {
                commit('SERVERALBUMDATA_MUTATION', response.data)
                commit('CURRENTALBUM_MUTATION', dataPayload.name)
            })
    },
    postMusicToPlaylist({ commit }, dataPayload){
        axios.post('http://localhost:3000/addToPlaylist', JSON.stringify(dataPayload))
            .then(response => {
                commit("ADDPLAYLISTRES_MUTATE", response.data)
            })
    },
    delMusicFromPlaylist({ commit, dispatch }, dataPayload){
        axios.post('http://localhost:3000/delFromPlaylist', JSON.stringify(dataPayload))
            .then(response => {
                commit("DELPLAYLISTRES_MUTATE", response.data)
                dispatch("getPlaylistMusic")
                commit("PLAYSTATUS_MUTATE", {status: false, id: null})
                document.getElementById("audio").pause();
                commit("RESETMUSICTIMES_MUTATE")
            })
    },
    getPlaylistMusic({commit}){
        axios.post('http://localhost:3000/getData', JSON.stringify({action: "Playlist"}))
            .then(response => {
                commit("PLAYLISTFROMSERVER_MUTATION", response.data)
            })
    },
    getUploadList({ commit }){
        axios.post('http://localhost:3000/getUploadData', JSON.stringify({action: "First"}))
            .then(response => {
                commit('LOCATION_MUTATION', "upload");
                commit('SERVERDATA_MUTATION', response.data)
                commit('CURRENTALBUM_MUTATION', response.data.dirs[0])
            })
    },
    getSpecificUploadAlbum({ commit }, dataPayload){
        axios.post('http://localhost:3000/getUploadData', JSON.stringify(dataPayload))
            .then(response => {
                commit('SERVERALBUMDATA_MUTATION', response.data)
                commit('CURRENTALBUM_MUTATION', dataPayload.name)
            })
    },
}

// mutations
const mutations = {
    SERVERDATA_MUTATION(state, list) {
        state.dataList = JSON.parse(JSON.stringify(list));
    },
    SERVERALBUMDATA_MUTATION(state, list) {
        state.dataList.files = JSON.parse(JSON.stringify(list.files));
    },
    CURRENTALBUM_MUTATION(state, name){
        state.currentAlbumName = {there: true, name: name};
    },
    CURRENTPLAYEDALBUM_MUTATION(state, name){
        state.currentPlayedAlbumName = name
    },
    PLAYSTATUS_MUTATE(state, obj){
        state.playStatus = obj;
    },
    STARTAUDIOCONTROLS_MUTATE(state){
        let audio = document.getElementById("audio");
        let barBody = document.getElementById("barBody");
        audio.volume = 0.1;
        audio.ontimeupdate = (e) => {
            if(state.playStatus.status == true){
                state.musicTimeStr = timeToString(Math.floor(e.target.currentTime));
                state.musicTime = e.target.currentTime;
                
                if(state.musicMaxTime > 0){
                    state.progressBarWidth = (state.musicTime / state.musicMaxTime) * 100 + "%";
                }
            }
        };
        audio.onloadeddata = (e) => {
            state.musicMaxTimeStr = timeToString(Math.floor(e.target.duration));
            state.musicMaxTime = e.target.duration;
            audio.volume = state.volume;
        }

        audio.onended = (e) => {
            let end = false;
            if(state.randomStatus == false){
                if(state.playStatus.id != null && state.playStatus.id + 1 < state.dataList.files.length){
                    state.playStatus.id = state.playStatus.id + 1;
                } else if(state.playStatus.id != null && state.loopStatus == true){
                    state.playStatus.id = 0;
                } else if(state.playStatus.id != null) {
                    end = true;
                }
            } else {
                if(state.playStatus.id != null){
                    state.playStatus.id = Math.floor(Math.random() * state.dataList.files.length)
                }
            }
            e.target.pause();
            if(end == false){
                if(state.currentAlbumName.there == true){
                    document.getElementById("audio_src").src = `http://localhost:3000/${state.location}/${state.currentAlbumName.name}/${state.dataList.files[state.playStatus.id].name}`;
                } else {
                    document.getElementById("audio_src").src = `http://localhost:3000/${state.dataList.files[state.playStatus.id].origin}/${state.dataList.files[state.playStatus.id].album}/${state.dataList.files[state.playStatus.id].name}`;
                }
                e.target.load();
                e.target.play();
            } else {
                state.playStatus = {status: false, id: state.playStatus.id}
            }
        };

        barBody.onclick = (e) => {
            let position = e.clientX - e.currentTarget.offsetLeft + 1;
            let percentage = position / e.currentTarget.offsetWidth ;

            if(state.musicMaxTime > 0){
                let time = Math.floor(state.musicMaxTime * percentage);
                audio.currentTime = time;
            }
        }

        function timeToString(time) {
            let min = Math.floor(time / 60) % 60;
            let sec = time % 60;

            let stingMin = (min) < 10 ? `0${min}` : `${min}`
            let stringSec = (sec) < 10 ? `0${sec}` : `${sec}`

            return `${stingMin}:${stringSec}`;
        }
    },
    RESETMUSICTIMES_MUTATE(state){
        state.musicTime = 0;
        state.musicMaxTime = 0;
        state.musicTimeStr = "00:00";
        state.musicMaxTimeStr = "00:00";
        state.progressBarWidth = 0;
    },
    ADDPLAYLISTRES_MUTATE(state, data){
        if(data.status == false){
            alert("UTWÓR JEST JUŻ NA PLAYLIŚCIE")
        } else {
            alert("DODANO UTWÓR NA PLAYLISTE")
        }
    },
    DELPLAYLISTRES_MUTATE(state, data){
        if(data.status == true){
            alert("UTWÓR ZOSTAŁ USUNIĘTY")
        }
    },
    PLAYLISTFROMSERVER_MUTATION(state, data){
        state.currentAlbumName = {there: false};
        state.dataList.files = JSON.parse(JSON.stringify(data.files))
    },
    LOCATION_MUTATION(state, locate){
        state.location = locate;
    },
    VOLUME_MUTATION(state, value){
        state.volume = value;
    },
    LOOP_MUTATION(state){
        state.loopStatus = !state.loopStatus;
    },
    RANDOM_MUTATION(state){
        state.randomStatus = !state.randomStatus;
    }
}

//export store
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
})