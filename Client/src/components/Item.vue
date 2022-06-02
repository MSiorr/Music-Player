<template>
    <div id="row" @mouseover="hover = true" @mouseleave="hover = false" :style="{backgroundColor: (playStatus.id == propId) || (hover == true) ? 'rgba(0,0,0,0.2)' : 'transparent'}">
        <span class="musicInfo small" v-if="currentAlbum.there == false">[{{propData.origin.toUpperCase()}}]</span>
        <span class="musicInfo">{{(currentAlbum.there) == true ? currentAlbum.name : propData.album}}</span>
        <span class="musicInfo">{{propData.name}}</span>
        <span class="musicInfo">{{musicSize}}</span>
        <span id="musicPlayPause"><img id="musicStatusImg" v-if="hover" @click="changePlayStatus" :src="(playStatus.status) == true && (playStatus.id) == propId ? 'http://localhost:3000/controls/pause.png' : 'http://localhost:3000/controls/play.png'"></span>
        <span id="PlaylistControl" v-if="currentAlbum.there"><img id="addPlaylistImg" v-if="hover" @click="addToPlaylist" :src="'http://localhost:3000/controls/add.png'" alt=""></span>
        <span id="PlaylistControl" v-if="currentAlbum.there == false"><img id="delPlaylistImg" v-if="hover" @click="delFromPlaylist" :src="'http://localhost:3000/controls/del.png'" alt=""></span>
    </div>
</template>

<script>
    export default {
        props: ["propData", "propId"],
        data() {
            return {
                musicSize: (this.propData.size / 1048576).toFixed(2) + " MB",
                hover: false 
            }
        },
        computed: {
            currentAlbum() {
                return this.$store.getters.getAlbumName;
            },
            playStatus() {
                return this.$store.getters.getPlayStatus;
            },
            location() {
                return this.$store.getters.getLocation;
            }
        },
        methods: {
            changePlayStatus() {
                let status = null;
                let change = null;
                if(this.playStatus.id == this.propId){
                    change = false;
                    status = !this.playStatus.status;
                } else {
                    change = true;
                    status = true;
                }
                let audio = document.getElementById("audio");
                audio.volume = 0.1;
                if(change == true){
                    if(this.currentAlbum.there == true) {
                        document.getElementById("audio_src").src = `http://localhost:3000/${this.location}/${this.currentAlbum.name}/${this.propData.name}`;
                        this.$store.commit("CURRENTPLAYEDALBUM_MUTATION", this.currentAlbum.name)
                    } else {
                        document.getElementById("audio_src").src = `http://localhost:3000/${this.propData.origin}/${this.propData.album}/${this.propData.name}`;
                        this.$store.commit("CURRENTPLAYEDALBUM_MUTATION", this.propData.album)
                    }
                    audio.load();
                }
                if(status == true){
                    audio.play();
                } else {
                    audio.pause();
                }
                let obj = {status: status, id: this.propId};
                this.$store.commit("PLAYSTATUS_MUTATE", obj);
            },
            addToPlaylist(){
                let dataPayload = {
                    album: this.currentAlbum.name,
                    name: this.propData.name,
                    size: this.propData.size,
                    origin: this.location
                }
                this.$store.dispatch("postMusicToPlaylist", dataPayload);
            },
            delFromPlaylist(){
                let dataPayload = {
                    album: (this.currentAlbum.there) == true ? this.currentAlbum.name : this.propData.album,
                    name: this.propData.name,
                    size: this.propData.size,
                    origin: this.propData.origin
                }
                this.$store.dispatch("delMusicFromPlaylist", dataPayload);
            }
        }
    }
</script>

<style scoped>
    #row {
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: whitesmoke;
        padding: 10px;
        height: 30px;
    }
    .musicInfo {
        width: calc((100% - 200px) / 3);
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .small {
        text-align: left;
        max-width: 120px;
    }
    #musicPlayPause {
        width: 34px;
        margin: 0;
        padding: 0;
    }
    #PlaylistControl {
        padding-left: 10px;
        margin: 0;
        width: 40px;
    }
    #musicStatusImg, #addPlaylistImg, #delPlaylistImg {
        width: 30px;
        cursor: pointer;
    }
</style>