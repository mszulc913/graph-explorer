<template>
  <div>
    <b-row>
      <b-col class="menu-left mt-4" cols="3">
          <b-row>
            <b-card class="text-center mb-2">
              <b-row>
                <b-col>
                  <div v-if="selectedNode && selectedNode.entityType" class="text-center">
                    <b-checkbox
                      v-model="executeForType"
                      v-if="selectedNode.entityType"
                    >Execute for all of the entities from the type <b>{{ selectedNode.entityType.value }}</b></b-checkbox>
                  </div>
                  <div v-else><h5>No type availiable</h5></div>
                </b-col>
              </b-row>
              <b-row class='mt-3 mb-1 text-center'>
                <b-col>
                  <b-button variant='danger' v-if="selectedNode" @click="deleteNodes(selectedNode.id)">
                    <span v-if="!loading">
                      <span v-if="executeForType && selectedNode.entityType">Delete all nodes with the same type as node selected</span>
                      <span v-else>Delete selected node</span>
                    </span>
                    <span v-else>
                      <b-spinner label="Spinning"></b-spinner>
                    </span>
                  </b-button>
                </b-col>
              </b-row>
            </b-card>
          </b-row>
          <b-row>
            <b-card no-body style="max-width: 20rem;" class="mb-5">
              <template v-slot:header>
                <h5 class="mb-0 text-center">Add nodes by property</h5>
              </template>
              <div v-if="selectedNode">
                <div v-if="selectedNode.data.cached_properties">
                  <b-list-group class="text-center" flush>
                    <b-list-group-item v-for="(property, key) in selectedNode.data.cached_properties" v-bind:key="key"
                    @click="loading ? null : addConnectedNodesByProperty(selectedNode, property)"
                    class="bg-light"
                    :style="{cursor: loading ? '' : 'pointer'}"
                    >
                    <b>{{ formatLabel(property.predicate.value) }}
                    </b></b-list-group-item>
                  </b-list-group>
                </div>
                <b-card-body v-else><h5 class="text-center" >No properties found</h5></b-card-body>
              </div>
              <b-card-body v-else><h5 class="text-center">No node selected</h5></b-card-body>
            </b-card>
          </b-row>
        </b-col>
        <b-col>
          <b-row>
            <b-col style="height: 700px">
              <graph
                class="graph mt-3"
                :nodes="nodes"
                :edges="edges"
                v-if="renderGraph"
                @nodeSelected="selectNode($event);"
                @edgeSelected="selectEdge($event)"
                @unselected="selectedNode = null; selectedEdge = null"
              ></graph>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <h3 class="text-center mt-4"
              >{{ selectedNode ? selectedNode.data.value : (selectedEdge ? selectedEdge.data.value : "") }}</h3>
            </b-col>
          </b-row>
          <b-row class="text-center mt-2">
            <b-col>
              <b-card>
              <b-row>
                <b-col>
                  <b-button :disabled="nodeValuesSet.size == 0" class="mr-2 bg-light text-dark" @click="exportGraph()">
                    Export graph
                  </b-button>
                </b-col>
                <b-col>
                  <b-row>
                    <b-col>
                      <div class="custom-file">
                        <input type="file" class="custom-file-input" id="inputGroupFile01" ref="fileUpload" @change="importGraph()"
                          aria-describedby="inputGroupFileAddon01">
                        <label class="custom-file-label text-left" for="inputGroupFile01">Import graph</label>
                      </div>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>


              </b-card>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="3" class="menu-right mt-4">
          <b-row class="text-center">
            <b-card>
                Maximum number of entities in a single DB query result:<b-input class="mt-1" v-model="queryLimit"></b-input>
            </b-card>
          </b-row>
          <b-row class="text-center mt-2">
            <b-card style="width: 100%">
              Add new nodes via regex match
              <b-form-input v-model="currentFilter"></b-form-input>
              <b-button class="mt-2" @click="fetchNodes" :disabled="!currentFilter">
                <span v-if="!loading">Fetch</span>
                <span v-else>
                  <b-spinner label="Spinning"></b-spinner>
                </span>
              </b-button>
            </b-card>
          </b-row>
          <b-row class="text-center mt-2">
            <b-card style="width: 100%">
              Active database
              <b-row>
                <b-col class="mt-2">
                  <b-button
                    :disabled="activeDB == 'linkedmdb'"
                    @click="renderGraph = false; activeDB = 'linkedmdb'; resetGraph(); selectedEntity1 = null; selectedEntity2 = null"
                    :class="getDbSelectionButtonColor('linkedmdb')"
                    >
                    <span v-if="!loading">Linkedmdb</span>
                    <span v-else>
                      <b-spinner label="Spinning"></b-spinner>
                    </span>
                  </b-button>
                  <b-button
                  class="ml-2"
                  :disabled="activeDB == 'dbtropes'"
                  @click="renderGraph = false; activeDB = 'dbtropes'; resetGraph(); selectedEntity1 = null; selectedEntity2 = null"
                  :class="getDbSelectionButtonColor('dbtropes')"
                  >
                    <span v-if="!loading">DBTropes</span>
                    <span v-else>
                      <b-spinner label="Spinning"></b-spinner>
                    </span>
                  </b-button>  
                </b-col>
              </b-row>
            </b-card>
          </b-row>
          <b-row class="text-center mt-2">
            <b-card style="width: 100%">
              <h4>Find shortest path</h4>

              <b-button class="mt-2"
              :disabled="!selectedNode || selectedNode.data.type !== 'uri'"
              @click="selectedEntity1 = selectedNode"
              ><span v-if="selectedEntity1">{{ selectedEntity1.data.value }}</span>
              <span v-else>Choose curently selected node as first node in a path</span>
              </b-button>

              <b-button class="mt-2"
              :disabled="!selectedNode || selectedNode.data.type !== 'uri'"
              @click="selectedEntity2 = selectedNode"
              ><span v-if="selectedEntity2">{{ selectedEntity2.data.value }}</span>
              <span v-else>Choose curently selected node as second node in a path</span>
              </b-button>
              <b-button
              :disabled='!selectedEntity1 || !selectedEntity2 || loading'
              class="mt-2"
              variant="warning"
              @click="findShortestPath"
              >
                <span v-if="!loading">Find shortest path</span>
                <span v-else>
                  <b-spinner label="Spinning"></b-spinner>
                </span>
              </b-button>
            </b-card>
          </b-row>
        </b-col>
      </b-row>
      <notifications group="notif" position="top center"/>
    </div>
</template>

<script>
import Graph from "../components/Graph.vue";
import axios from "../axios-sparql.js";
import vis from "visjs-network";
import { Utils } from "./utils.js"
import { Consts } from "./consts.js"
import { GraphToNTExporter } from "./export.js"
import { NTToGraphImporter } from "./import.js"

const MAX_LABEL_LEN = 50;
const SHORTEST_PATH_MAX_LEN = 10

export default {
  data() {
    return {
      activeDB: 'linkedmdb',
      valueNodeIdMap: {},
      edgeSet: new Set(),
      renderGraph: true,
      nodeValuesSet: new Set(),
      nodes: new vis.DataSet([]),
      edges: new vis.DataSet([]),
      selectedNode: null,
      selectedEdge: null,
      selectedValue: "",
      executeForType: false,
      queryLimit: 20,
      currentNodeId: 1,
      uploadedFile: null,
      currentFilter: "",
      selectedEntity1: null,
      selectedEntity2: null,
      loading: false,
      shortestPathEdges: [],
    };
  },
  components: {
    Graph
  },
  methods: {
    exportGraph(){
      const exporter = new GraphToNTExporter(this.nodes, this.edges)
      const outputString = exporter.export()

      const url = window.URL.createObjectURL(new Blob([outputString]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'output.nt')
      document.body.appendChild(link)
      link.click()

      this.$notify({
        group: 'notif',
        type: "success!",
        title: 'Success',
        text: 'Graph has been exported!'
      });
      
    },
    importGraph(){
      const file = this.$refs.fileUpload.files[0]
      if (!file)
        return 

      let reader = new FileReader();
      reader.readAsText(file, "UTF-8")
      let vue = this
      vue.resetGraph()
      this.renderGraph = false
      this.loading = true

      reader.onload = function() {
        try {
          const importer = new NTToGraphImporter(reader.result)
          const parsingResult = importer.import()

          parsingResult.nodes.forEach(node => {
            // nodes without properties
            if (!vue.isNodeExists(node)) {
              vue.addNode(node)
            }
          })

          parsingResult.predicates.forEach(triple => {
            // triples
            if (!vue.isNodeExists(triple.object)) {
              vue.addNode(triple.object)
            }
            if (!vue.isNodeExists(triple.subject)) {
              vue.addNode(triple.subject)
            }

            const edgeKey = `${triple.property.predicate.value}_${
              vue.valueNodeIdMap[triple.subject.value]
            }_${vue.valueNodeIdMap[triple.object.value]}`;
            if (!vue.edgeSet.has(edgeKey)) {
              vue.addEdge(triple.subject, triple.object, triple.property.predicate, edgeKey)
            }
          })
          vue.renderGraph = true

          vue.$notify({
            group: 'notif',
            type: "success",
            title: 'Success',
            text: 'Graph imported'
          });
          vue.loading = false

        } catch (error) {
          console.log(error)
          vue.$notify({
            group: 'notif',
            type: "error",
            title: 'Unable to import',
            text: 'Please check if the input file has proper format.'
          });
          vue.loading = false
        }
      };     
    },
    formatLabel(value) {
      return Utils.formatLabel(value, MAX_LABEL_LEN)
    },
    fetchNodes() {
      this.loading = true
      const query =
        `SELECT DISTINCT ?x ?y ?z
          WHERE {
             BIND(<http://www.w3.org/2000/01/rdf-schema#label> as ?y)
             ?x ?y ?z
             FILTER(regex(str(?z), "${this.currentFilter}"))
          }
          LIMIT ${this.queryLimit}`;
      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          response.data.results.bindings.forEach(triple => {
            if (!this.isNodeExists(triple.x)) {
              this.addNode(triple.x)
            }
            if (!this.isNodeExists(triple.z)) {
              this.addNode(triple.z)
            }
            const edgeKey = `${triple.y.value}_${
              this.valueNodeIdMap[triple.x.value]
            }_${this.valueNodeIdMap[triple.z.value]}`;
            if (!this.edgeSet.has(edgeKey)) {
              this.addEdge(triple.x, triple.z, triple.y, edgeKey)
            }
          });
          this.renderGraph = true
          this.$notify({
            group: 'notif',
            type: response.data.results.bindings.length > 0 ? 'success' : '',
            title: 'Success',
            text: `Fetched ${response.data.results.bindings.length} nodes`
          });
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    addNode(data){
      const newId = this.currentNodeId++
      this.nodeValuesSet.add(data.value);
      this.valueNodeIdMap[data.value] = newId;
      const color = data.type === 'uri' ? Consts.SECONDARY_COLOR : 'white'
      this.nodes.add({
        id: newId,
        label: this.formatLabel(data.value),
        data: data,
        edges: new Set(),
        color: {
          background: color
        }
      });
    },
    deleteNodes(nodeId){
      if (!this.executeForType){
        this.deleteNode(nodeId)     
      } else {
        this.deleteNodeType(nodeId)
      }
      this.selectedNode = null;  
    },
    deleteNode(nodeId){
      var node = this.nodes._data[nodeId]
      node.edges.forEach( edge => {
        const edgeSplitted = edge.split('_')
        const nodeId1 = edgeSplitted[edgeSplitted.length - 2]
        const nodeId2 = edgeSplitted[edgeSplitted.length - 1]
        this.nodes._data[nodeId1].edges.delete(edge)
        this.nodes._data[nodeId2].edges.delete(edge)
        this.edgeSet.delete(edge)
        this.edges.remove({id: edge})
      })
      this.nodeValuesSet.delete(node.data.value);
      this.nodes.remove({id:nodeId});
      delete this.valueNodeIdMap[node.data.value];

      this.$notify({
        group: 'notif',
        type: "success",
        title: 'Success',
        text: 'Node deleted.'
      });
      this.loading = false
    },
    deleteNodeType(nodeId){
      const selected = this.selectedNode
      let deletedNodes = 0
      this.loading = true
      Object.keys(this.nodes._data).forEach( key => {
        const node = this.nodes._data[key]
        
        if (node.data.type !== 'uri' || node === this.selectedNode){
          return
        }

        if (!node.entityType){
          const query = `SELECT DISTINCT ?y
            WHERE{ <${node.data.value}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?y }`;
          axios
            .get(this.activeDB, { params: { query: query } })
            .then(response => {
              if (response.data.results.bindings.length) {
                const entityType = response.data.results.bindings[0].y
                if (entityType.value === selected.entityType.value) {
                  this.deleteNode(key)
                }
              }
            })
            .catch(error => {
              this.handleErrorNotification(error)
              this.loading = false
            });
          } else {
              if (node.entityType.value === selected.entityType.value) {
                this.deleteNode(key)
              }
          }
          deletedNodes++
        
      })
      this.deleteNode(nodeId)  
      this.$notify({
        group: 'notif',
        type: "success",
        title: 'Success',
        text: `Deleted ${deletedNodes + 1} nodes`
      });    
      this.loading = false
    },
    addEdge(dataSource, dataTarget, property, key, color, width){
      this.edgeSet.add(key);
      let edge = {
        id: key,
        from: this.valueNodeIdMap[dataSource.value],
        to: this.valueNodeIdMap[dataTarget.value],
        label: this.formatLabel(property.value),
        data: property,
      };
      if (color){
        edge.color = {
          color: color
        }
      }
      if (width){
        edge.width = width
      }
      this.edges.add(edge)
      this.nodes._data[this.valueNodeIdMap[dataSource.value]].edges.add(key)
      this.nodes._data[this.valueNodeIdMap[dataTarget.value]].edges.add(key)
    },
    fetchPropertiesNodes(node){
      this.loading = true
      const query = `SELECT DISTINCT ?predicate
        WHERE{ <${node.data.value}> ?predicate ?y }`;
      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          node.data.cached_properties = response.data.results.bindings;
          this.fetchEntityType(node);
        })
        .catch(error => {
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    fetchConnectedNodesByPropertyForEntityType(node, property){
      const nodesInGraph = this.getNodesInGraph()
      this.loading = true
      const query = `SELECT DISTINCT ?x ?y
      WHERE {
        ?x <${property.predicate.value}> ?y .
        ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${this.selectedNode.entityType.value}>
        VALUES ?x { ${nodesInGraph} }
      } LIMIT ${this.queryLimit}`;

      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          response.data.results.bindings.forEach(row => {
            if (!this.isNodeExists(row.y)) {
              this.addNode(row.y)
            }
            const edgeKey = `${property.predicate.value}_${
              this.valueNodeIdMap[row.x.value]
            }_${this.valueNodeIdMap[row.y.value]}`;
            if (!this.edgeSet.has(edgeKey)) {
              this.addEdge(row.x, row.y, property.predicate, edgeKey)
            }
          });
          this.$notify({
            group: 'notif',
            type: "success",
            title: 'Success',
            text: `Properties fetched`
          });  
          this.loading = false
        })
        .catch(error => {
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    fetchEntityType(node) {
      this.loading = true
      const query = `SELECT DISTINCT ?y
        WHERE{ <${node.data.value}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?y }`;
      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          if (response.data.results.bindings.length) {
            node.entityType = response.data.results.bindings[0].y
          }
          this.selectedNode = node;
          this.loading = false
        })
        .catch(error => {
          // TODO error toasts
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    selectNode(nodeId) {
      this.executeForType = false
      if (!nodeId)
        return
      const node = this.nodes._data[nodeId];
      this.selectedEdge = null;
      if (node.data.type !== "uri") {
        this.selectedNode = node;
        this.executeForType = false;
      } else {
        if (node.data.cached_properties === undefined) {
          this.fetchPropertiesNodes(node)
        } else {
          this.selectedNode = node;
        }
      }
    },
    isNodeExists(data){
      return this.nodeValuesSet.has(data.value)
    },
    selectEdge(edgeId) {
      if (!edgeId)
        return
      this.selectedEdge = this.edges._data[edgeId];
      this.selectedNode = null
    },
    addConnectedNodesByProperty(node, property) {
      if (this.executeForType && this.selectedNode.entityType) {
        this.fetchConnectedNodesByPropertyForEntityType(node, property)
      } else {
        this.fetchConnectedNodesByPropertyForSingleEntity(node, property)
      }
    },
    getNodesInGraph(){
      return Object.values(this.nodes._data)
        .map(x => {
          return x.data.type === "uri" ? `<${x.data.value}>` : "";
        })
        .join(" ");
    },
    getDbSelectionButtonColor(db){
      if (this.activeDB === db)
        return "btn-success"
      else
        return ""
    },
    resetGraph(){
      this.shortestPathEdges = []
      this.valueNodeIdMap = {}
      this.edgeSet = new Set()
      this.nodeValuesSet = new Set()
      this.nodes = new vis.DataSet([])
      this.edges = new vis.DataSet([])
      this.selectedNode = null
      this.selectedEdge = null
      this.selectedValue = ""
      this.currentNodeId = 1
    },
    fetchConnectedNodesByPropertyForSingleEntity(node, property){
      this.loading = true
      const query = `SELECT DISTINCT ?y
      WHERE { <${node.data.value}> <${property.predicate.value}> ?y } LIMIT ${this.queryLimit}`;

      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          response.data.results.bindings.forEach(row => {
            if (!this.isNodeExists(row.y)) {
              this.addNode(row.y)
            }
            const edgeKey = `${property.predicate.value}_${
              this.valueNodeIdMap[node.data.value]
            }_${this.valueNodeIdMap[row.y.value]}`;
            if (!this.edgeSet.has(edgeKey)) {
              this.addEdge(node.data, row.y, property.predicate, edgeKey)
            }
          });
          this.$notify({
            group: 'notif',
            type: "success",
            title: 'Success',
            text: `Property fetched`
          });  
          this.loading = false
        })
        .catch(error => {
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    handleErrorNotification(error){
      let text = 'Please check the database connection.'
      if(error.response && error.response.status == 500){
        text = `Datbase internal error: \n ${error}`
      }
      this.$notify({
        group: 'notif',
        type: "error",
        title: 'Unable to fetch data',
        text: text
      });
    },
    findShortestPath(){
      this.loading = true;
      this.findPath(this.selectedEntity1, this.selectedEntity2, 1)
    },
    findPath(node1, node2, i){
      const query = Utils.buildFindPathQuery(node1, node2, i)

      if (i == SHORTEST_PATH_MAX_LEN){
        this.loading = false
        this.$notify({ 
          group: 'notif',
          type: "warn",
          title: 'Finished',
          text: 'No path with length up to 10 found.'
        });
        return
      }

      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
          if (response.data.results.bindings.length > 0){
            let results = []
            Object.keys(response.data.results.bindings[0]).sort().forEach(x => {
              let node = response.data.results.bindings[0][x]
              results.push(node)
              if (!this.isNodeExists(node)) {
                this.addNode(node)
              }
            })
            this.fetchPropertiesForThePath(results, response.data.results.bindings.length > 1)
          } else {
            this.findPath(node1, node2, i + 1)
          }
        })
        .catch(error => {
          console.log(error)
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    fetchPropertiesForThePath(nodesPath, isOnePath){
      this.loading = false

      const query = Utils.buildFindPathPropertiesQuery(nodesPath)

      axios
        .get(this.activeDB, { params: { query: query } })
        .then(response => {
            this.clearShortesPathColor()
            Object.keys(response.data.results.bindings[0]).sort().forEach((x, i) => {
              let property = response.data.results.bindings[0][x]
              let edgeKey = ''
              if (x[0] == 'y'){
                edgeKey = `${property.value}_${
                  this.valueNodeIdMap[nodesPath[i].value]
                }_${this.valueNodeIdMap[nodesPath[i + 1].value]}`;
              } else {
                edgeKey = `${property.value}_${
                  this.valueNodeIdMap[nodesPath[i + 1].value]
                }_${this.valueNodeIdMap[nodesPath[i].value]}`;
              }

              if (!this.edgeSet.has(edgeKey)) {
                if (x[0] == 'y'){
                  this.addEdge(nodesPath[i], nodesPath[i + 1], property, edgeKey, Consts.COLOR1, 3)
                } else {
                  this.addEdge(nodesPath[i + 1], nodesPath[i], property, edgeKey, Consts.COLOR1, 3)
                }
              } else {
                this.recolourEdge(edgeKey, Consts.COLOR1, 3)
              }
              this.shortestPathEdges.push(edgeKey)
            })

          const text = isOnePath ? 'Shortest path found.' : 'More than one shortest paths found. First one fetched.'
          this.$notify({ 
            group: 'notif',
            type: "success",
            title: 'Success',
            text: text
          });
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.handleErrorNotification(error)
          this.loading = false
        });
    },
    recolourEdge(edgeKey, color, width){
        let edge = this.edges._data[edgeKey]
        edge.color = {color: color}
        edge.width = width
        this.edges.remove({id: edgeKey})
        this.edges.add(edge)
    },
    clearShortesPathColor(){
      this.shortestPathEdges.forEach(edge => {
        this.recolourEdge(edge, Consts.PRIMARY_COLOR, 1)
      })
      this.shortestPathEdges = []
    }
  },
};
</script>


<style lang="css" scoped>
.graph {
  width: 180%;
  position: relative;
  left: -40%;
  height: 700px;
}

.menu-left {
  position: relative;
  left: -20%;
}

.menu-right {
  position: relative;
  left: 20%;
}

.card {
  width: 100%
}
</style>