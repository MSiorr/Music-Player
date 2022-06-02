<template>
    <div id="audioPanel">
        <div id="progress">
            <div id="barBody">
                <div id="barProgress" :style="{width: progressBarWidth}"></div>
            </div>
            <div id="musicTimeDiv">
                <div>{{musicTimeStr}}</div>
                <div>{{musicMaxTimeStr}}</div>
            </div>
        </div>
        <div id="addonControls">
            <img @click="changeLoop" src="http://localhost:3000/controls/loop.png" class="inactiveControl">
            <img @click="changeRandom" src="http://localhost:3000/controls/random.png" class="inactiveControl">
        </div>
        <div id="controls">
            <img @click="changeTrack(-1)" src="http://localhost:3000/controls/rewind.png" class="changeAudio">
            <img @click="changePlayStatus" :src="(playStatus.status) == true ? 'http://localhost:3000/controls/pause.png' : 'http://localhost:3000/controls/play.png'" id="playPause" >
            <img @click="changeTrack(1)" src="http://localhost:3000/controls/forward.png" class="changeAudio">
        </div>
        <div id="volumeDiv">
            <img src="http://localhost:3000/controls/volumeMin.png" id="audioImg">
            <input type="range" id="volumeRange" min="0" max="1" step="0.01" value="0.1" v-on:input="changeVolume">
        </div>
        <div id="audioInfo">{{(playStatus.id) != null ? `${currentPlayedAlbum} / ${albumData.files[playStatus.id].name}` : "Title"}}</div>
        <audio id="audio">
        <source src=""
                id="audio_src"
                type="audio/mp3"
                style="display: none;" />
        </audio>
    </div>
</template>

<script>
    export default {
        mounted(){
            this.$store.commit("STARTAUDIOCONTROLS_MUTATE");
        },

        computed: {
            playStatus() {
                return this.$store.getters.getPlayStatus;
            },
            albumData() {
                return this.$store.getters.getData;
            },
            albumName() {
                return this.$store.getters.getAlbumName;
            },
            currentPlayedAlbum() {
                return this.$store.getters.getPlayedAlbumName;
            },
            musicTimeStr() {
                return this.$store.getters.getMusicTimeStr;
            },
            musicMaxTimeStr() {
                return this.$store.getters.getMusicMaxTimeStr;
            },
            progressBarWidth() {
                return this.$store.getters.getProgressBarWidth;
            },
            location() {
                return this.$store.getters.getLocation;
            },
            loopStatus(){
                return this.$store.getters.getLoopStatus;
            },
            randomStatus(){
                return this.$store.getters.getRandomStatus;
            }
        },
        methods: {
            changePlayStatus() {
                let status = !this.playStatus.status;
                let audio = document.getElementById("audio");
                if(this.playStatus.id == null) {
                    status = this.playStatus.status;
                } else { 
                    if(status == true){
                        audio.play();
                    } else {
                        audio.pause();
                    }
                }
                let obj = {status: status, id: this.playStatus.id};
                this.$store.commit("PLAYSTATUS_MUTATE", obj);
            },
            changeTrack(direct) {
                if(this.playStatus.id != null && (this.playStatus.id + direct >= 0 && this.playStatus.id + direct < this.albumData.files.length)){

                    let audio = document.getElementById("audio");
                    if(this.albumName.there == true){
                        document.getElementById("audio_src").src = `http://localhost:3000/${this.location}/${this.albumName.name}/${this.albumData.files[this.playStatus.id + direct].name}`;
                    } else {
                        document.getElementById("audio_src").src = `http://localhost:3000/${this.albumData.files[this.playStatus.id + direct].origin}/${this.albumData.files[this.playStatus.id + direct].album}/${this.albumData.files[this.playStatus.id + direct].name}`;
                    }
                    audio.load();
                    audio.play();

                    let obj = {status: this.playStatus.status, id: this.playStatus.id + direct};
                    this.$store.commit("PLAYSTATUS_MUTATE", obj);

                }
            },
            changeVolume(e){
                let img = document.getElementById("audioImg");
                if(e.target.value == 0){
                    img.src = "http://localhost:3000/controls/volumeMute.png";
                } else if (e.target.value <= 0.5 ){
                    img.src = "http://localhost:3000/controls/volumeMin.png";
                } else {
                    img.src = "http://localhost:3000/controls/volumeMax.png";
                }
                e.target.style.background = `linear-gradient(to right, white 0%, white ${(e.target.value / 1) * 100}%, rgb(72, 72, 72) ${(e.target.value / 1) * 100}%, rgb(72, 72, 72) 100%)`;
                this.$store.commit("VOLUME_MUTATION", e.target.value);
                document.getElementById("audio").volume = e.target.value;
            },
            changeLoop(e){
                if(this.loopStatus == true){
                    e.target.classList.add("inactiveControl")
                } else {
                    e.target.classList.remove("inactiveControl")
                }
                this.$store.commit("LOOP_MUTATION");
            },
            changeRandom(e){
                if(this.randomStatus == true){
                    e.target.classList.add("inactiveControl")
                } else {
                    e.target.classList.remove("inactiveControl")
                }
                this.$store.commit("RANDOM_MUTATION");
            }
        }
    }
</script>

<style scoped>
    #audioPanel {
        width: 100%;
        position: relative;
    }

    #audioInfo {
        height: 30px;
        background-color: rgb(0,0,0,0.2);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
    }

    #controls {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #controls img {
        margin: 10px;
        background-color: transparent;
        outline: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .changeAudio {
        width: 100px;
        height: 100px;
    }

    #playPause {
        width: 120px;
        height: 120px;
    }

    #progress {
        width: 400px;
        margin: 0 auto;
    }

    #barBody {
        height: 16px;
        margin: 5px 0;
        width: 100%;
        background-color: rgb(87, 87, 87);
        cursor: pointer;
    }

    #barProgress {
        height: 100%;
        width: 50%;
        background-color: white;
    }

    #musicTimeDiv {
        display: flex;
        justify-content: space-between;
        color: white;
    }

    #volumeDiv{
        position: absolute;
        top: 70px;
        right: 5%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    #volumeRange {
        width: 120px;
        background: linear-gradient(to right, white 0%, white 10%, rgb(72, 72, 72) 10%, rgb(72, 72, 72) 100%);
        -webkit-appearance: none;
        height: 10px;
        outline: none;
        opacity: 0.7;
        transition: opacity .2s;
        border-radius: 5px;
        /* overflow: hidden; */
    }

    #volumeRange:hover{
        opacity: 1;
    }

    #volumeRange::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 100%;
        cursor: pointer;
    }

    #volumeRange::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 100%;
        cursor: pointer;
    }

    #addonControls {
        position: absolute;
        top: 70px;
        left: 5%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    #addonControls img {
        margin: 0 16px;
        cursor: pointer;
    }

    .inactiveControl {
        filter: opacity(0.5) drop-shadow(0 0 0 black)
    }

    .inactiveControl:hover {
        filter: none;
    }
</style>

