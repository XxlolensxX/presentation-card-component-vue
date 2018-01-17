// Importando Vue
window.Vue = require('vue');

// importando axios
window.axios = require('axios');

// Componentes
Vue.component('presentation-card',require('./components/presentation-card.vue'));

// instancia Vue principal
var vm = new Vue({
    el: '#app',
    data:{
    	//uri: $('meta[name=url-app]').attr('content') + '/',
    },
    created(){

    },
    methods:{

    },
});
