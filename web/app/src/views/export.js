class GraphToNTExporter {

    constructor(nodesDataSet, edgesDataSet) {
        this.nodesDataSet = nodesDataSet;
        this.edgesDataSet = edgesDataSet;
      }

    export(){
        let outputString = ""
        let outputStatements = []
        this.edgesDataSet.forEach(edge => {
            let fromString = this._getOutputLabel(this.nodesDataSet._data[edge.from])
            let toString = this._getOutputLabel(this.nodesDataSet._data[edge.to])

            outputStatements.push({
                from: fromString,
                to: toString,
                property: `<${edge.data.value}>`
            })
        })
        outputString = outputStatements.map(x => {
            return `${x.from} ${x.property} ${x.to}`
        }).join(' . \n')
        return outputString + '.'
    }

    _getOutputLabel(node){
        if (node.data.type === 'uri'){
            return `<${node.data.value}>`
        } else {
            if (node.data.datatype){
                return `"${node.data.value}"^^<${node.data.datatype}>` 
            } else {
                if (node.data['"xml:lang"'])
                    return `"${node.data.value}"@${node.data['"xml:lang"']}`
                else
                    return `"${node.data.value}"`
            }
        }
    }

}

export { GraphToNTExporter }