<template>
  <div id="body">
    <div id="leftMenu">
      <img id="playlistImg" src="http://localhost:3000/controls/playlist.png" @click="onPlaylistClick">
    </div>
    <div id="main">
      <div id="header">
        <h1 id="title">{{title}}</h1>
        <div id="coverList">
          <cover v-for="cover in albumData.dirs" :key="cover" :prop-data="cover"  class="cover"></cover>
        </div>
      </div>
      <div id="musicList">
        <item v-for="(music, i) in albumData.files" :key="music._id" :prop-data="music" :prop-id="i" class="item"></item>
      </div>
      <div id="footer">
        <audio-control></audio-control>
      </div>
    </div>
    <div id="rightMenu">
      <img id="uploadOrAlbum" :src="(location) == 'mp3' ? 'http://localhost:3000/controls/upload.png' : 'http://localhost:3000/controls/albums.png'" @click="uploadSwitch()">
    </div>
  </div>
</template>

<script>
import AudioControl from './components/audioControl.vue';
import Cover from './components/Cover.vue';
import Item from './components/Item.vue';
  export default {
  components: { Cover, Item, AudioControl },
    mounted() {
      this.$store.dispatch("getMusicList");
    },
    data() {
      return {
        title: "WEBPLAYER"
      }
    },
    computed: {
      albumData() {
        return this.$store.getters.getData
      },
      location(){
        return this.$store.getters.getLocation
      }
    },
    methods: {
      getDataFetch() {
        document.getElementById("info").innerHTML = JSON.stringify(this.$store.getters.getData,null,4)
      },
      onPlaylistClick() {
        this.$store.dispatch("getPlaylistMusic");
        let obj = {status: false, id: null};
        this.$store.commit("PLAYSTATUS_MUTATE", obj)
        let audio = document.getElementById("audio");
        audio.pause();
        audio.currentTime = 0;
        this.$store.commit("RESETMUSICTIMES_MUTATE");
      },
      uploadSwitch(){
        if(this.location == "mp3"){
          this.$store.dispatch("getUploadList");
        } else {
          this.$store.dispatch("getMusicList");
        }
        let obj = {status: false, id: null};
        this.$store.commit("PLAYSTATUS_MUTATE", obj)
        let audio = document.getElementById("audio");
        audio.pause();
        audio.currentTime = 0;
        this.$store.commit("RESETMUSICTIMES_MUTATE");
      }
    }
  }
</script>

<style>
  body, html{
   margin: 0;
   padding: 0; 
   background-color: rgb(48, 48, 48);
   min-width: 850px;
   height: 100vh;
   overflow: hidden;
  }
  #body {
    display: flex;
  }
  #leftMenu {
    width: 70px;
    height: calc(100vh - 219px);
    background-color: rgb(38,38,38);
    border-right: 5px solid white;
    display: flex;
    justify-content: center;
  }
  #rightMenu {
    width: 70px;
    height: calc(100vh - 219px);
    background-color: rgb(38,38,38);
    border-left: 5px solid white;
    display: flex;
    justify-content: center;
  }
  #main {
    width: calc(100% - 150px);
  }
  #playlistImg, #uploadOrAlbum {
    width: 70px;
    height: 70px;
    border-bottom: 5px solid white;
    cursor: pointer;
  }
  #coverList {
    border-top: 5px solid whitesmoke;
    border-bottom: 5px solid whitesmoke;
    overflow-x: auto;
    overflow-y: hidden;
    text-align: center;
    white-space: nowrap;
    background-color: rgba(0,0,0,0.2);
    padding: 17px 0;
    height: 170px;
  }
  .cover {
    display: inline-block;
    margin: 2px 2px;
    border: 2px solid black;
  }
  #title {
    text-align: center;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    font-size: 40px;
    margin: 11.5px 0;
    color: whitesmoke;
  }
  #musicList {
    overflow-y: auto;
    margin-bottom: 170px;
    height: calc(100vh - 503px);
  }
  .item {
    border-top: 2px solid whitesmoke;
    border-bottom: 2px solid whitesmoke;
    margin: 5px 0;
  }

  #musicList *:last-child {
    margin-bottom: 0;
  }
  #musicList *:first-child {
    margin-top: 0;
  }
  #footer {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    height: 214px;
    min-width: 850px;
    background-color: rgb(38,38,38);
    border-top: 5px solid white;
  }
</style>