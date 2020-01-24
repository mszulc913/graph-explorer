const N3 = require('n3');

class GraphToNTExporter {

    constructor(nodesDataSet, edgesDataSet) {
        this.nodesDataSet = nodesDataSet;
        this.edgesDataSet = edgesDataSet;
      }

    export(){
        const writer = new N3.Writer({ format: 'N-Triples' });
        this.edgesDataSet.forEach(edge => {
            let subj = this._getOutput(this.nodesDataSet._data[edge.from])
            let obj = this._getOutput(this.nodesDataSet._data[edge.to])
            let pred = N3.DataFactory.namedNode(edge.data.value)
            writer.addQuad(subj, pred, obj)
        })

        this.nodesDataSet.forEach(node => {
            if (node.edges.size === 0){
                let obj = N3.DataFactory.blankNode('x')
                let pred = N3.DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
                let subj = N3.DataFactory.namedNode(node.data.value)
                writer.addQuad(subj, pred, obj)
            }
        })

        let output = null

        writer.end((error, result) => output = result)

        return output
    }

    _getOutput(node){
        if (node.data.type === 'uri'){
            return N3.DataFactory.namedNode(node.data.value)
        } else {
            if (node.data.datatype){
                return N3.DataFactory.literal(node.data.value, N3.DataFactory.namedNode(node.data.datatype))
            } else {
                if (node.data['"xml:lang"'])
                    return N3.DataFactory.literal(node.data.value, node.data['"xml:lang"'])
                else
                    return N3.DataFactory.literal(node.data.value)
            }
        }
    }

}

export { GraphToNTExporter }