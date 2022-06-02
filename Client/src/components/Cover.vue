<template>
    <div>
        <div id="coverAfter" :data-album="propData" @click="chooseAlbum()">
            <img :src="coverUrl">
        </div>
    </div>
</template>

<script>
    export default {
        props: ["propData"],
        computed: {
            location() {
                return this.$store.getters.getLocation;
            },
            coverUrl() {
                return "http://localhost:3000/" + this.location + "/" + this.propData + "/okladka.jpg";
            }
        },
        methods: {
            chooseAlbum() {
                let dataPayload = {
                    action: "NEXT",
                    name: this.propData
                }
                if(this.location == "mp3"){
                    this.$store.dispatch("getSpecificAlbum", dataPayload);
                } else {
                    this.$store.dispatch("getSpecificUploadAlbum", dataPayload);
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

<style scoped>
    img, div{
        width: 160px;
        height: 160px;
        cursor: pointer;
    }
    #coverAfter{
        position: relative;
    }
    #coverAfter::after {
        content: attr(data-album);
        white-space: initial;
        text-overflow: ellipsis;
        overflow: hidden;
        background-color: rgba(0,0,0,0.5);
        color: white;
        position: absolute;
        top: 0;
        left: 0;
        width: 160px;
        height: 160px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        font-size: 20px;
        transition: all .5s;
        opacity: 0;
    }
    #coverAfter:hover::after {
        opacity: 1;
    }
</style>