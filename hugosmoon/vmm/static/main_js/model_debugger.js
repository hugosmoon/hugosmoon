let Main = {
    data() {
        this.openFullScreen(200);
        return {
            model_name: ''
        }
    },

    methods: {
        greet: function (xx) {
            bcdl=this.$refs.cutting_depth.value;
        },
    }

}
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')



