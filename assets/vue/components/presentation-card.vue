<template>

  <div class="presentation-card row">
    <div class="gr-4 presentation-card__head">
      <h2>{{empresa.nombre}}</h2>
    </div>
    <div class="gr-8 presentation-card__body">
      <div class="photo">
        <span class="icon-elem icon-elem--person_outline"></span>
      </div>
      <div class="info">
        <p>Lorem : Ipsum</p>
        <p>Lorem : +569 9495 0495</p>
        <p>Lorem : Hola Mundo</p>
      </div>
    </div>
  </div>

</template>


<script>
export default{
  data(){
    return{
      empresas : [
        {
          nombre : 'Ubrain',
          direccion: 'Direccion Z231'
        },
        {
          nombre : 'IDA',
          direccion: 'Direccion X231'
        }
      ]
    }
  },
  created(){

    console.log(this.a);
  }
}
</script>


<style></style>
