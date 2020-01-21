<template>
  <div id='graph' ref="graph"></div>
</template>




<script>

import vis from 'visjs-network'

const options = {
  autoResize: true,
  height: '100%',
  width: '100%',
  clickToUse: false,
  nodes: {
    shape: 'dot',
    size: 15,
  },
  physics: {
    maxVelocity: 10,
    barnesHut: {
      gravitationalConstant: -2000,
      avoidOverlap: 0.8
    }
  },
}

export default {
  props: {
    nodes: Object,
    edges: Object,
  },
  data () {
    return {
    }
  },
  mounted(){
    // create a network
    var container = this.$refs.graph
    var data = {
      nodes: this.nodes,
      edges: this.edges
    };
    var network = new vis.Network(container, data, options);
    var vue = this

    network.on("dragStart", function (params) {
      if(params.nodes[0])
        vue.$emit("nodeSelected", params.nodes[0])
      else if (params.edges[0])
        vue.$emit("edgeSelected", params.edges[0])
    });

    network.on("click", function (params) {
      if(params.nodes[0])
        vue.$emit("nodeSelected", params.nodes[0])
      else if (params.edges[0])
        vue.$emit("edgeSelected", params.edges[0])
      else
        vue.$emit("unselected")
    });

  }
}
</script>
<style src="visjs-network/dist/vis.css"></style>


